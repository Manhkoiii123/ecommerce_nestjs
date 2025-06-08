import { Injectable } from '@nestjs/common';
import { RoleAlreadyExistsException } from 'src/routes/role/role.error';
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  UpdateRoleBodyType,
} from 'src/routes/role/role.model';
import { RoleRepo } from 'src/routes/role/role.repo';
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
      const role = await this.roleRepo.update({
        id,
        data,
        updatedById,
      });
      return role;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintError(error)) throw RoleAlreadyExistsException;
      throw error;
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
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
