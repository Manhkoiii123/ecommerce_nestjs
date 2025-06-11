import { Injectable } from '@nestjs/common';
import {
  BrandIncludeTranslationType,
  BrandType,
  CreateBrandBodyType,
  GetBrandsQueryType,
  GetBrandsResType,
  UpdateBrandBodyType,
} from 'src/routes/brand/brand.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class BrandRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list(
    pagination: GetBrandsQueryType,
    languageId?: string,
  ): Promise<GetBrandsResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.brand.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.brand.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          brandTranslations: {
            where: languageId
              ? { languageId, deletedAt: null }
              : { deletedAt: null },
          },
        },
        orderBy: {
          createdAt: 'desc',
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

  async findById(
    id: number,
    languageId?: string,
  ): Promise<BrandIncludeTranslationType | null> {
    return this.prismaService.brand.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        brandTranslations: {
          where: languageId
            ? { languageId, deletedAt: null }
            : { deletedAt: null },
        },
      },
    });
  }
  create({
    createdById,
    data,
  }: {
    createdById: number | null;
    data: CreateBrandBodyType;
  }): Promise<BrandIncludeTranslationType> {
    return this.prismaService.brand.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        brandTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateBrandBodyType;
    updatedById: number;
  }): Promise<BrandIncludeTranslationType> {
    return this.prismaService.brand.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        brandTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  delete(id: number, isHard?: boolean): Promise<BrandType> {
    return isHard
      ? this.prismaService.brand.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brand.update({
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
