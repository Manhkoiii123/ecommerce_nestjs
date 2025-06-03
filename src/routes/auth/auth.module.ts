import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RoleService } from 'src/routes/auth/role.service';
import { AuthRepository } from 'src/routes/auth/auth.repo';

@Module({
  providers: [AuthService, RoleService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
