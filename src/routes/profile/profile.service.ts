import { Injectable } from '@nestjs/common';
import {
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from 'src/routes/profile/profile.model';
import {
  InvalidPasswordException,
  NotFoundRecordException,
} from 'src/shared/error';
import { isUniqueConstraintError } from 'src/shared/helpers';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}
  async getProfile(userId: number) {
    const user =
      await this.sharedUserRepository.findUniqueIncludeRolePermissions({
        id: userId,
        deletedAt: null,
      });
    if (!user) throw NotFoundRecordException;
    return user;
  }
  async updateProfile({
    userId,
    body,
  }: {
    userId: number;
    body: UpdateMeBodyType;
  }) {
    try {
      return await this.sharedUserRepository.update(
        { id: userId, deletedAt: null },
        {
          ...body,
          updatedById: userId,
        },
      );
    } catch (error) {
      if (isUniqueConstraintError(error)) throw NotFoundRecordException;
      throw error;
    }
  }

  async changePassword({
    userId,
    body,
  }: {
    userId: number;
    body: Omit<ChangePasswordBodyType, 'confirmNewPassword'>;
  }) {
    try {
      const { newPassword, password } = body;
      const user = await this.sharedUserRepository.findUnique({
        id: userId,
        deletedAt: null,
      });
      if (!user) throw NotFoundRecordException;
      const isPasswordValid = await this.hashingService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) throw InvalidPasswordException;
      const hashedPassword = await this.hashingService.hash(newPassword);
      await this.sharedUserRepository.update(
        { id: userId, deletedAt: null },
        { password: hashedPassword, updatedById: userId },
      );
      return {
        message: 'Change password successfully',
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
