import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { ApiKeyGuard } from 'src/shared/guards/apiKey.guard';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { EmailService } from 'src/shared/services/email.service';
import { TwoFactorAuthService } from 'src/shared/services/2fa.service';
import { S3Service } from 'src/shared/services/s3.service';
const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  AccessTokenGuard,
  ApiKeyGuard,
  SharedUserRepository,
  EmailService,
  TwoFactorAuthService,
  S3Service,
];
@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
