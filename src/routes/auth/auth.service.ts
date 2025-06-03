/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import {
  LoginBodyType,
  RegisterBodyType,
  SendOtpBodyType,
} from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repo';
import { RoleService } from 'src/routes/auth/role.service';
import {
  generateOTP,
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';
import { SharedUserRepository } from 'src/shared/repositories/shared-user..repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import ms from 'ms';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants';
import { EmailService } from 'src/shared/services/email.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  AccessTokenPayload,
  AccessTokenPayloadCreate,
} from 'src/shared/types/jwt.type';
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const verifycationCode =
        await this.authRepository.findUniqueVerificationCode({
          email: body.email,
          type: TypeOfVerificationCode.REGISTER,
          code: body.code,
        });

      if (!verifycationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Invalid verification code',
            path: 'code',
          },
        ]);
      }
      if (verifycationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'Verification code has expired',
            path: 'code',
          },
        ]);
      }
      const clientRoleId = await this.roleService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
      return user;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
  async sendOtp(body: SendOtpBodyType) {
    // tìm email đã tồn tại hay chưa => chưa thì mới tạo otp
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    });
    if (user) {
      throw new UnprocessableEntityException([
        {
          errors: 'Email already exists',
          path: 'email',
        },
      ]);
    }
    const code = generateOTP();
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    });
    // send mail
    const { data, error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    });
    if (error) {
      throw new UnprocessableEntityException('Failed to send email');
    }
    return verificationCode;
  }
  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    });
    if (!user) {
      throw new UnprocessableEntityException('Account not found');
    }
    const isPasswordValid = await this.hashingService.compare(
      body.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          errors: 'Invalid password',
        },
      ]);
    }
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    });
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    return tokens;
  }

  async generateTokens({
    userId,
    deviceId,
    roleId,
    roleName,
  }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({ userId }),
    ]);
    const decodedRefreshToken =
      await this.tokenService.verifyAccessToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     const { userId } =
  //       await this.tokenService.verifyRefreshToken(refreshToken);
  //     // kiểm tra có trong db ko
  //     await this.prismaService.refreshToken.findFirstOrThrow({
  //       where: {
  //         token: refreshToken,
  //       },
  //     });
  //     // xóa refresh token
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     });
  //     // tạo token mới
  //     return this.generateTokens({ userId });
  //   } catch (error) {
  //     // đã ref rồi thì thông báo cho user biết bị đánh căp token
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token is invalid');
  //     }
  //     throw new UnauthorizedException(error);
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     await this.tokenService.verifyRefreshToken(refreshToken);
  //     // xóa refresh token
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     });

  //     // tạo token mới
  //     return {
  //       message: 'Logout successfully',
  //     };
  //   } catch (error) {
  //     throw new UnauthorizedException(error);
  //   }
  // }
}
