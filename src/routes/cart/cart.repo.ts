import { Injectable } from '@nestjs/common';
import {
  InvalidQuantityException,
  NotFoundSKUException,
  OutOfStockSKUException,
  ProductNotFoundException,
} from 'src/routes/cart/cart.error';
import {
  AddToCartBodyType,
  CartItemDetailType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartItemBodyType,
} from 'src/routes/cart/cart.model';
import { NotFoundCartItemException } from 'src/routes/order/order.error';
import { SKUSchemaType } from 'src/routes/product/sku.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}
  private async validateSKU({
    skuId,
    quantity,
    userId,
    isCreate,
  }: {
    skuId: number;
    quantity: number;
    userId: number;
    isCreate: boolean;
  }): Promise<SKUSchemaType> {
    const [cartItem, sku] = await Promise.all([
      this.prismaService.cartItem.findUnique({
        where: {
          userId_skuId: {
            userId,
            skuId,
          },
        },
      }),
      this.prismaService.sKU.findUnique({
        where: { id: skuId, deletedAt: null },
        include: {
          product: true,
        },
      }),
    ]);
    if (!sku) {
      throw NotFoundSKUException;
    }
    if (!cartItem) {
      throw NotFoundCartItemException;
    }
    if (isCreate && quantity + cartItem.quantity > sku.stock) {
      throw InvalidQuantityException;
    }
    if (sku.stock < 1 || sku.stock < quantity) {
      throw OutOfStockSKUException;
    }
    const { product } = sku;
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw ProductNotFoundException;
    }
    return sku;
  }
  async findAll({
    userId,
    languageId,
    limit,
    page,
  }: {
    userId: number;
    languageId: string;
    limit: number;
    page: number;
  }): Promise<GetCartResType> {
    const [data] = await Promise.all([
      this.prismaService.cartItem.findMany({
        where: {
          userId,
          sku: {
            product: {
              deletedAt: null,
              publishedAt: {
                lte: new Date(),
                not: null,
              },
            },
          },
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where:
                      languageId === ALL_LANGUAGE_CODE
                        ? { deletedAt: null }
                        : { languageId, deletedAt: null },
                  },
                  createdBy: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);
    const groupMap = new Map<number, CartItemDetailType>();
    for (const item of data) {
      const shopId = item.sku.product.createdById;
      if (shopId) {
        if (!groupMap.has(shopId)) {
          groupMap.set(shopId, {
            shop: item.sku.product.createdBy,
            cartItems: [],
          });
        }
        groupMap.get(shopId)?.cartItems.push(item);
      }
    }
    const sortedGroup = Array.from(groupMap.values());
    const skip = (page - 1) * limit;
    const take = limit;
    const totalGroup = sortedGroup.length;
    const pagedGroups = sortedGroup.slice(skip, skip + take);
    return {
      data: pagedGroups,
      totalItems: totalGroup,
      limit,
      page,
      totalPages: Math.ceil(totalGroup / limit),
    };
  }
  async create(userId: number, body: AddToCartBodyType): Promise<CartItemType> {
    await this.validateSKU({
      skuId: body.skuId,
      quantity: body.quantity,
      userId,
      isCreate: true,
    });
    return this.prismaService.cartItem.upsert({
      where: {
        userId_skuId: {
          userId,
          skuId: body.skuId,
        },
      },
      update: {
        quantity: {
          increment: body.quantity,
        },
      },
      create: {
        userId,
        skuId: body.skuId,
        quantity: body.quantity,
      },
    });
  }
  async update({
    userId,
    cartItemId,
    body,
  }: {
    userId: number;
    cartItemId: number;
    body: UpdateCartItemBodyType;
  }): Promise<CartItemType> {
    await this.validateSKU({
      skuId: body.skuId,
      quantity: body.quantity,
      userId: userId,
      isCreate: false,
    });
    return this.prismaService.cartItem.update({
      where: { id: cartItemId, userId },
      data: {
        skuId: body.skuId,
        quantity: body.quantity,
      },
    });
  }
  delete(userId: number, body: DeleteCartBodyType): Promise<{ count: number }> {
    return this.prismaService.cartItem.deleteMany({
      where: {
        userId,
        id: {
          in: body.cartItemIds,
        },
      },
    });
  }
}
