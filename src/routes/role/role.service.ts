import { Injectable } from '@nestjs/common';
import {
  ProhibitedDeletedRoleException,
  RoleAlreadyExistsException,
} from 'src/routes/role/role.error';
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  UpdateRoleBodyType,
} from 'src/routes/role/role.model';
import { RoleRepo } from 'src/routes/role/role.repo';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}
  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination);
    return data;
  }
  async findById(id: number) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw NotFoundRecordException;
    return role;
  }
  async create({
    data,
    createdById,
  }: {
    data: CreateRoleBodyType;
    createdById: number;
  }) {
    try {
      return this.roleRepo.create({
        data,
        createdById,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw RoleAlreadyExistsException;
      throw error;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateRoleBodyType;
    updatedById: number;
  }) {
    try {
      const role = await this.roleRepo.findById(id);
      if (!role) throw NotFoundRecordException;

      // ko cho update admin
      if (role.name === RoleName.Admin) {
        throw ProhibitedDeletedRoleException;
      }
      const updatedRole = await this.roleRepo.update({
        id,
        data,
        updatedById,
      });
      return updatedRole;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintError(error)) throw RoleAlreadyExistsException;
      throw error;
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      // ko cho xóa 3 cái cơ bản
      const role = await this.roleRepo.findById(id);
      if (!role) throw NotFoundRecordException;
      const baseRole: string[] = [
        RoleName.Admin,
        RoleName.Seller,
        RoleName.Client,
      ];
      if (baseRole.includes(role.name)) {
        throw ProhibitedDeletedRoleException;
      }
      await this.roleRepo.delete({ id, deletedById });
      return {
        message: 'Success.RoleDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
