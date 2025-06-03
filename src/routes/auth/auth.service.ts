/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RegisterBodyType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repo';
import { RoleService } from 'src/routes/auth/role.service';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
  ) {}
  async register(body: RegisterBodyType) {
    try {
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
      throw new Error(error);
    }
  }
  // async login(body: any) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: {
  //       email: body.email,
  //     },
  //   });
  //   if (!user) {
  //     throw new UnauthorizedException('Account not found');
  //   }
  //   const isPasswordValid = await this.hashingService.compare(
  //     body.password,
  //     user.password,
  //   );
  //   if (!isPasswordValid) {
  //     throw new UnprocessableEntityException([
  //       {
  //         field: 'password',
  //         errors: 'Invalid password',
  //       },
  //     ]);
  //   }
  //   const tokens = await this.generateTokens({ userId: user.id });

  //   return tokens;
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ]);
  //   const decodedRefreshToken =
  //     await this.tokenService.verifyAccessToken(refreshToken);
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       userId: payload.userId,
  //       token: refreshToken,
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   });
  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

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
