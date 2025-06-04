import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RoleService } from 'src/routes/auth/role.service';
import { AuthRepository } from 'src/routes/auth/auth.repo';
import { GoogleService } from 'src/routes/auth/google.service';

@Module({
  providers: [AuthService, RoleService, AuthRepository, GoogleService],
  controllers: [AuthController],
})
export class AuthModule {}
