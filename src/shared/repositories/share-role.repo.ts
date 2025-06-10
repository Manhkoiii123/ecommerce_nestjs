import { Injectable } from '@nestjs/common';
import { RoleType } from 'src/routes/auth/auth.model';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ShareRoleRepo {
  private clientRoleId: number | null = null;
  private adminRoleId: number | null = null;
  constructor(private readonly prismaService: PrismaService) {}
  private async getRole(name: string) {
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE name = ${name} AND "deletedAt" IS NULL LIMIT 1;
    `.then((res: RoleType[]) => {
      if (res.length === 0) {
        throw new Error('Client role not found');
      }
      return res[0];
    });
    return role;
  }
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }
    const role = await this.getRole(RoleName.Client);
    if (!role) {
      throw new Error('Client role not found');
    }
    this.clientRoleId = role.id;
    return role.id;
  }
  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.clientRoleId;
    }
    const role = await this.getRole(RoleName.Admin);
    if (!role) {
      throw new Error('Admin role not found');
    }
    this.adminRoleId = role.id;
    return role.id;
  }
}
