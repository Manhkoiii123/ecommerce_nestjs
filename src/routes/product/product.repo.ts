/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import {
  ALL_LANGUAGE_CODE,
  OrderByType,
  SortBy,
  SortByType,
} from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async list({
    limit,
    page,
    name,
    brandIds,
    categories,
    minPrice,
    maxPrice,
    createdbyId,
    isPublic,
    languageId,
    orderBy,
    sortBy,
  }: {
    limit: number;
    page: number;
    name?: string;
    brandIds?: number[];
    categories?: number[];
    minPrice?: number;
    maxPrice?: number;
    createdbyId?: number;
    isPublic?: boolean;
    languageId: string;
    orderBy: OrderByType;
    sortBy: SortByType;
  }): Promise<GetProductsResType> {
    const skip = (page - 1) * limit;
    const take = limit;
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: createdbyId ? createdbyId : undefined,
    };
    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      };
    } else if (isPublic === false) {
      where = {
        OR: [
          { ...where, publishedAt: null },
          { ...where, publishedAt: { gt: new Date() } },
        ],
      };
    }
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    if (brandIds && brandIds.length > 0) {
      where.brandId = {
        in: brandIds,
      };
    }
    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          id: {
            in: categories,
          },
        },
      };
    }
    if (minPrice !== undefined) {
      where.base_price = {
        gte: minPrice,
      };
    }
    if (maxPrice !== undefined) {
      where.base_price = {
        lte: maxPrice,
      };
    }
    let caculatedOrderBy:
      | Prisma.ProductOrderByWithRelationInput
      | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: orderBy,
    };
    if (sortBy === SortBy.Price) {
      caculatedOrderBy = {
        base_price: orderBy,
      };
    } else if (sortBy === SortBy.Sale) {
      caculatedOrderBy = {
        orders: {
          _count: orderBy,
        },
      };
    }
    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.product.findMany({
        where,
        include: {
          productTranslations: {
            where:
              languageId === ALL_LANGUAGE_CODE
                ? { deletedAt: null }
                : { languageId, deletedAt: null },
          },
          orders: {
            where: {
              deletedAt: null,
              status: 'DELIVERED',
            },
          },
        },

        orderBy: caculatedOrderBy,
        skip,
        take,
      }),
    ]);
    return {
      data,
      totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
  findById({ productId }: { productId: number }): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
      },
    });
  }
  async getDetail({
    productId,
    languageId,
    isPublic,
  }: {
    productId: number;
    languageId: string;
    isPublic?: boolean;
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
    };
    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      };
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      };
    }
    return this.prismaService.product.findUnique({
      where,
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
        this.prismaService.productTranslation.updateMany({
          where: {
            productId: id,
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

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateProductBodyType;
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data;
    return this.prismaService.product.create({
      data: {
        ...productData,
        createdById,
        skus: {
          createMany: {
            data: skus,
          },
        },
        categories: {
          connect: categories.map((id) => ({ id })),
        },
      },
      include: {
        productTranslations: {
          where: {
            deletedAt: null,
          },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  // UPDATE PRODUCT
  // sku đã tồn tại trong db nhưng ko có trong data(ng gửi lên) thì sẽ bị xóa
  // sku đã tồn tại trong db nhưng có trong data(ng gửi lên) thì sẽ bị cập nhật
  // sku chua tạo trong db thì sẽ bị tạo

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number;
    updatedById: number;
    data: UpdateProductBodyType;
  }): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = data;
    // lấy sku đã tồn tại trong db
    const existingSkus = await this.prismaService.sKU.findMany({
      where: {
        productId: id,
        deletedAt: null,
      },
    });
    // tìm các sku cần xóa (có trong db nhưng ko có trong data)
    const skusToDelete = existingSkus.filter((sku) =>
      dataSkus.every((dataSku) => dataSku.value !== sku.value),
    );
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id);
    // map id vào data payload
    const skuWithId = dataSkus.map((dataSku) => {
      const existingSku = existingSkus.find(
        (sku) => sku.value === dataSku.value,
      );
      return {
        ...dataSku,
        id: existingSku ? existingSku.id : null,
      };
    });

    // tìm sku để update
    const skusToUpdate = skuWithId.filter((sku) => sku.id !== null);

    const skusToCreate = skuWithId
      .filter((sku) => sku.id === null)
      .map((sku) => {
        // tạo mới thì bỏ cái id đi
        const { id: skuId, ...rest } = sku;
        return {
          ...rest,
          productId: id,
          createdById: updatedById,
        };
      });

    // dùng transaction để khi 1 cái lỗi thì nó sẽ dừng lại luôn
    const [product] = await this.prismaService.$transaction([
      // cập nhật product
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById,
          categories: {
            connect: categories.map((id) => ({ id })),
          },
        },
      }),
      // xóa sku ko có trong gửi lên
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      }),
      // update sku
      ...skusToUpdate.map((sku) => {
        return this.prismaService.sKU.update({
          where: {
            id: sku.id as number,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        });
      }),
      // thêm mới
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ]);

    return product;
  }
}
