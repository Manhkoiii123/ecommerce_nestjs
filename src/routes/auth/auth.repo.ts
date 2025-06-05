import { Injectable } from '@nestjs/common';
import {
  DeviceType,
  RefreshTokenType,
  RoleType,
  VerificationCodeType,
} from 'src/routes/auth/auth.model';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constants';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Pick<
      UserType,
      'roleId' | 'email' | 'name' | 'password' | 'phoneNumber'
    >,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }
  async createUserIncludeRole(
    user: Pick<
      UserType,
      'roleId' | 'email' | 'name' | 'password' | 'phoneNumber' | 'avatar'
    >,
  ): Promise<UserType & { role: RoleType }> {
    return await this.prismaService.user.create({
      data: user,
      include: { role: true },
    });
  }
  async createVerificationCode(
    payload: Pick<
      VerificationCodeType,
      'email' | 'type' | 'code' | 'expiresAt'
    >,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
      create: payload,
    });
  }
  async findUniqueVerificationCode(
    uniqueValue:
      | {
          email: string;
        }
      | { id: number }
      | {
          email: string;
          code: string;
          type: TypeOfVerificationCodeType;
        },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }

  createRefreshToken(data: {
    token: string;
    userId: number;
    expiresAt: Date;
    deviceId: number;
  }) {
    return this.prismaService.refreshToken.create({ data });
  }
  createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({ data });
  }
  async findUniqueUserIncludeRole(
    uniqueObject: { email: string } | { id: number },
  ): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      include: { role: true },
    });
  }

  async findUniqueRefreshTokenincludeUserRole(uniqueObject: {
    token: string;
  }): Promise<
    (RefreshTokenType & { user: UserType & { role: RoleType } }) | null
  > {
    return await this.prismaService.refreshToken.findUnique({
      where: uniqueObject,
      include: { user: { include: { role: true } } },
    });
  }

  async updateDevice(deviceId: number, data: Partial<DeviceType>) {
    return this.prismaService.device.update({
      where: { id: deviceId },
      data,
    });
  }
  async deleteRefreshToken(token: string) {
    return await this.prismaService.refreshToken.delete({ where: { token } });
  }

  async updateUser(
    where: { id: number } | { email: string },
    data: Partial<Omit<UserType, 'id' | 'roleId'>>,
  ): Promise<UserType> {
    return this.prismaService.user.update({ where, data });
  }
  deleteVerificationCode(
    uniqueValue:
      | {
          email: string;
        }
      | { id: number }
      | {
          email: string;
          code: string;
          type: TypeOfVerificationCodeType;
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.delete({ where: uniqueValue });
  }
}
