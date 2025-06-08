import { Injectable } from '@nestjs/common';
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  GetRolesResType,
  RoleType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from 'src/routes/role/role.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RoleRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ]);
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  async findById(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number | null;
    data: CreateRoleBodyType;
  }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        permissions: {
          connect: [],
        },
        createdById,
      },
    });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateRoleBodyType;
    updatedById: number;
  }): Promise<RoleType> {
    // kiểm tra permissionIds nếu có cái nào ko tồn tại hoặc bị xóa => lỗi
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds,
          },
          deletedAt: null,
        },
      });
      const deletedPermission = permissions.filter((p) => p.deletedAt);
      if (deletedPermission.length > 0) {
        const deletedPermissionIds = deletedPermission
          .map((p) => p.id)
          .join(', ');
        throw new Error(`Permission ${deletedPermissionIds} not found`);
      }
    }
    return this.prismaService.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }
  delete(
    { id, deletedById }: { id: number; deletedById: number },
    isHard?: boolean,
  ): Promise<RoleType> {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id,
          },
        })
      : this.prismaService.role.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        });
  }
}
