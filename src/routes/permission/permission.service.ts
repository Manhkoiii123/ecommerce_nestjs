import { Injectable } from '@nestjs/common';
import { PermissionAlreadyExistsException } from 'src/routes/permission/permission.error';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model';
import { PermissionRepo } from 'src/routes/permission/permission.repo';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}
  async list(pagination: GetPermissionsQueryType) {
    return this.permissionRepo.list(pagination);
  }
  async findById(id: number) {
    const Permission = await this.permissionRepo.findById(id);
    if (!Permission) throw NotFoundRecordException;
    return Permission;
  }
  async create({
    data,
    createdById,
  }: {
    data: CreatePermissionBodyType;
    createdById: number;
  }) {
    try {
      return this.permissionRepo.create({
        data,
        createdById,
      });
    } catch (error) {
      if (isUniqueConstraintError(error))
        throw PermissionAlreadyExistsException;
      throw error;
    }
  }
  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdatePermissionBodyType;
    updatedById: number;
  }) {
    try {
      const Permission = await this.permissionRepo.update({
        id,
        data,
        updatedById,
      });
      return Permission;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintError(error))
        throw PermissionAlreadyExistsException;
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.permissionRepo.delete(id);
      return {
        message: 'Success.PermissionDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
