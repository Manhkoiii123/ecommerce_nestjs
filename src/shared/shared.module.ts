import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { ApiKeyGuard } from 'src/shared/guards/apiKey.guard';
const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  AccessTokenGuard,
  ApiKeyGuard,
];
@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
