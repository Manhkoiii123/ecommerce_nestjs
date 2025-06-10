import { Injectable } from '@nestjs/common';
import { CreateUserResDTO } from 'src/routes/user/user.dto';
import {
  CreateUserBodyType,
  GetUserQueryType,
  GetUsersResType,
} from 'src/routes/user/user.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class UserRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list(pagination: GetUserQueryType): Promise<GetUsersResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        include: {
          role: true,
        },
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

  create({
    createdById,
    data,
  }: {
    createdById: number | null;
    data: CreateUserBodyType;
  }): Promise<CreateUserResDTO> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
      },
    });
  }
  delete({ id }: { id: number }, isHard?: boolean): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id,
          },
        })
      : this.prismaService.user.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
  }
}
