import { Injectable } from '@nestjs/common';
import { PermissionType } from 'src/routes/permission/permission.model';
import { RoleType } from 'src/routes/role/role.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';
type WhereUniqueUserType =
  | { id: number; [key: string]: any }
  | { email: string; [key: string]: any };
type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & { permissions: PermissionType[] };
};
@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  findUnique(uniqueObject: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
    });
  }

  findUniqueIncludeRolePermissions(
    uniqueObject: WhereUniqueUserType,
  ): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }
  update(
    where: WhereUniqueUserType,
    data: Partial<UserType>,
  ): Promise<UserType> {
    return this.prismaService.user.update({ where, data });
  }
}
