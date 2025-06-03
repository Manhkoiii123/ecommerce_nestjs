import { Injectable } from '@nestjs/common';
import {
  RegisterBodyType,
  VerificationCodeType,
} from 'src/routes/auth/auth.model';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constants';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> &
      Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
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
}
