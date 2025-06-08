import { Injectable } from '@nestjs/common';
import { RoleType } from 'src/routes/auth/auth.model';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null;
  constructor(private readonly prismaService: PrismaService) {}
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE name = ${RoleName.Client} AND "deletedAt" IS NULL LIMIT 1;
    `.then((res: RoleType[]) => {
      if (res.length === 0) {
        throw new Error('Client role not found');
      }
      return res[0];
    });

    // const role = await this.prismaService.role.findFirstOrThrow({
    //   where: {
    //     name: RoleName.Client,
    //   },
    // });
    if (!role) {
      throw new Error('Client role not found');
    }
    this.clientRoleId = role.id;
    return role.id;
  }
}
