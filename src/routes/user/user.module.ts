import { Module } from '@nestjs/common';
import { UserController } from 'src/routes/user/user.controller';
import { UserRepo } from 'src/routes/user/user.repo';
import { UserService } from 'src/routes/user/user.service';
import { ShareRoleRepo } from 'src/shared/repositories/share-role.repo';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepo, ShareRoleRepo],
})
export class UserModule {}
