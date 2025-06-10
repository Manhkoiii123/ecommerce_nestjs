import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  RoleNotFoundException,
  UserAlreadyExistException,
} from 'src/routes/user/user.error';
import {
  CreateUserBodyType,
  GetUserQueryType,
  UpdateUserBodyType,
} from 'src/routes/user/user.model';
import { UserRepo } from 'src/routes/user/user.repo';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isForekeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';
import { ShareRoleRepo } from 'src/shared/repositories/share-role.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly shareRoleRepo: ShareRoleRepo,
  ) {}
  list(pagination: GetUserQueryType) {
    return this.userRepo.list(pagination);
  }
  async findById(id: number) {
    const user =
      await this.sharedUserRepository.findUniqueIncludeRolePermissions({
        id,
        deletedAt: null,
      });
    if (!user) throw NotFoundRecordException;
    return user;
  }
  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType;
    createdById: number;
    createdByRoleName: string;
  }) {
    try {
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      });
      const hashPassword = await this.hashingService.hash(data.password);
      const user = await this.userRepo.create({
        createdById,
        data: {
          ...data,
          password: hashPassword,
        },
      });
      return user;
    } catch (error) {
      if (isForekeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }
      if (isUniqueConstraintError(error)) throw UserAlreadyExistException;
      throw error;
    }
  }
  private async verifyRole({
    roleNameAgent,
    roleIdTarget,
  }: {
    roleNameAgent: string;
    roleIdTarget: number;
  }) {
    if (roleNameAgent === RoleName.Admin) {
      return true;
    } else {
      // agent khong phai admin => k cho tao admin
      const adminRoleId = await this.shareRoleRepo.getAdminRoleId();
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException();
      }
      return true;
    }
  }
  async update({
    id,
    data,
    updateById,
    updateByRoleName,
  }: {
    id: number;
    data: UpdateUserBodyType;
    updateById: number;
    updateByRoleName: string;
  }) {
    try {
      const currentUser = await this.sharedUserRepository.findUnique({
        id,
        deletedAt: null,
      });
      if (!currentUser) throw NotFoundRecordException;
      const roleIdTarget = currentUser.roleId;
      await this.verifyRole({
        roleNameAgent: updateByRoleName,
        roleIdTarget,
      });
      const updateUser = await this.sharedUserRepository.update(
        { id },
        { ...data, updatedById: updateById },
      );
      return updateUser;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintError(error)) throw UserAlreadyExistException;
      if (isForekeyConstraintPrismaError(error)) throw RoleNotFoundException;
      throw error;
    }
  }
  async delete({
    id,
    deletedByRoleName,
  }: {
    id: number;
    deletedByRoleName: string;
  }) {
    try {
      // ko xóa chính mình
      // if (id === deletedById) throw new ForbiddenException(); => nếu có trường deletedById
      const currentUser = await this.sharedUserRepository.findUnique({
        id,
        deletedAt: null,
      });
      if (!currentUser) throw NotFoundRecordException;
      const roleIdTarget = currentUser.roleId;
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      });
      await this.userRepo.delete({
        id,
      });
      return {
        message: 'Successfully deleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
