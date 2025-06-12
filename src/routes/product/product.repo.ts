import { Injectable } from '@nestjs/common';
import {
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
} from 'src/routes/product/product.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async list(
    query: GetProductsQueryType,
    languageId: string,
  ): Promise<GetProductsResType> {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.product.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          productTranslations: {
            where:
              languageId === ALL_LANGUAGE_CODE
                ? { deletedAt: null }
                : { languageId, deletedAt: null },
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
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    };
  }
  async findById(
    id: number,
    languageId: string,
  ): Promise<GetProductDetailResType | null> {
    return this.prismaService.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        productTranslations: {
          where:
            languageId === ALL_LANGUAGE_CODE
              ? { deletedAt: null }
              : { languageId, deletedAt: null },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where:
                languageId === ALL_LANGUAGE_CODE
                  ? { deletedAt: null }
                  : { languageId, deletedAt: null },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where:
                languageId === ALL_LANGUAGE_CODE
                  ? { deletedAt: null }
                  : { languageId, deletedAt: null },
            },
          },
        },
      },
    });
  }

  async delete(id: number, isHard?: boolean): Promise<ProductType> {
    if (isHard) {
      const [product] = await Promise.all([
        this.prismaService.product.delete({
          where: {
            id,
          },
        }),
        this.prismaService.sKU.deleteMany({
          where: {
            productId: id,
          },
        }),
      ]);
      return product;
    } else {
      const [product] = await Promise.all([
        this.prismaService.product.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        }),
        this.prismaService.sKU.updateMany({
          where: {
            productId: id,
          },
          data: {
            deletedAt: new Date(),
          },
        }),
      ]);
      return product;
    }
  }
}
