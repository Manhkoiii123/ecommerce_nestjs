/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
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
import {
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
} from 'src/shared/constants/auth.constants';
import { EmailService } from 'src/shared/services/email.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  AccessTokenPayload,
  AccessTokenPayloadCreate,
} from 'src/shared/types/jwt.type';
import { promise } from 'zod';
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  InvalidOTPException,
  OTPExpiredException,
  TOTPAlreadyEnabledException,
} from 'src/routes/auth/error.model';
import { TwoFactorAuthService } from 'src/shared/services/2fa.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly twoFactorService: TwoFactorAuthService,
  ) {}

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string;
    code: string;
    type: TypeOfVerificationCodeType;
  }) {
    const verifycationCode =
      await this.authRepository.findUniqueVerificationCode({
        email_type_code: {
          email: email,
          type: type,
          code: code,
        },
      });

    if (!verifycationCode) {
      throw InvalidOTPException;
    }
    if (verifycationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }
    return verifycationCode;
  }
  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      });
      const clientRoleId = await this.roleService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
      await this.authRepository.deleteVerificationCode({
        email_type_code: {
          email: body.email,
          type: TypeOfVerificationCode.REGISTER,
          code: body.code,
        },
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
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException;
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException;
    }
    const code = generateOTP();
    await this.authRepository.createVerificationCode({
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
    return {
      message: 'OTP sent successfully',
    };
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

  async refreshToken({
    refreshToken,
    userAgent,
    ip,
  }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);
      // kiểm tra có trong db ko
      const tokenInDB =
        await this.authRepository.findUniqueRefreshTokenincludeUserRole({
          token: refreshToken,
        });
      if (!tokenInDB) {
        throw new UnauthorizedException('Refresh token is invalid');
      }
      const {
        deviceId,
        user: { roleId, name: roleName },
      } = tokenInDB;
      // cập nhật device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      });
      // xóa refresh token
      const $deleteRefreshToken =
        this.authRepository.deleteRefreshToken(refreshToken);
      // tạo token mới
      const $tokens = this.generateTokens({
        userId,
        roleId,
        roleName,
        deviceId,
      });
      const [, , tokens] = await Promise.all([
        $updateDevice,
        $deleteRefreshToken,
        $tokens,
      ]);
      return tokens;
    } catch (error) {
      // đã ref rồi thì thông báo cho user biết bị đánh căp token
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token is invalid');
      }
      throw new UnauthorizedException(error);
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken);
      // xóa refresh token
      const deleteRefreshToken =
        await this.authRepository.deleteRefreshToken(refreshToken);
      // cập nhật device đã logout
      await this.authRepository.updateDevice(deleteRefreshToken.deviceId, {
        isActive: false,
      });
      return {
        message: 'Logout successfully',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token is invalid');
      }
      throw new UnauthorizedException(error);
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body;
    // b1 kiểm tra có tỏng db ko
    const user = await this.sharedUserRepository.findUnique({ email });
    if (!user) {
      throw EmailNotFoundException;
    }
    // b2 kiểm tra otp
    await this.validateVerificationCode({
      email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    });
    // b3 cập nhật pas mới và xóa otp
    const hashedPassword = await this.hashingService.hash(newPassword);
    await this.authRepository.updateUser(
      { id: user.id },
      {
        password: hashedPassword,
      },
    );
    await this.authRepository.deleteVerificationCode({
      email_type_code: {
        email,
        code,
        type: TypeOfVerificationCode.FORGOT_PASSWORD,
      },
    });
    return {
      message: 'Reset password successfully',
    };
  }

  async setUpTwofactor(userId: number) {
    // lấy thông tin user, kiểm tra có tồn tại hay ko, và xem đã bật 2fa chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId });
    if (!user) {
      throw EmailNotFoundException;
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException;
    }
    // tạo sercet và uri
    const { secret, uri } = this.twoFactorService.generateTOTPSecret(
      user.email,
    );
    // cập nhật sercet vào user trong db
    await this.authRepository.updateUser(
      { id: userId },
      { totpSecret: secret },
    );
    // trả về sercet
    return {
      secret,
      uri,
    };
  }
}
