import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  NotFoundCartItemException,
  OrderNotFoundException,
  OutOfStockSKUException,
  SKUNotBelongToShopException,
} from 'src/routes/order/order.error';
import {
  CancelOrderResType,
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListResType,
} from 'src/routes/order/order.model';
import {
  OrderStatus,
  OrderStatusType,
} from 'src/shared/constants/order.constants';
import { isNotFoundPrismaError } from 'src/shared/helpers';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list({
    userId,
    limit,
    page,
    status,
  }: {
    userId: number;
    limit: number;
    page: number;
    status?: OrderStatusType;
  }): Promise<GetOrderListResType> {
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.OrderWhereInput = {
      userId,
      status,
    };
    const totalItem$ = this.prismaService.order.count({ where });
    const data$ = await this.prismaService.order.findMany({
      where,
      include: {
        items: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const [data, totalItems] = await Promise.all([data$, totalItem$]);
    return {
      data,
      totalItems: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
  async create(
    userId: number,
    body: CreateOrderBodyType,
  ): Promise<CreateOrderResType> {
    // validate body kiem tra itemIds co ton tai hay khong
    // kiem tra quantity co hop le hay khong
    // kiểm tra sản phẩm có bị xóa chưa
    // kiểm tra xem các sku trong cartItemIds có trong shopId ko
    // tạo order
    // xóa cartItem
    const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat();
    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: {
          in: allBodyCartItemIds,
        },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    });
    // validate body kiem tra itemIds co ton tai hay khong
    if (cartItems.length !== allBodyCartItemIds.length) {
      throw NotFoundCartItemException;
    }
    // kiem tra quantity co hop le hay khong
    const isOutOfStock = cartItems.some(
      (item) => item.quantity > item.sku.stock,
    );
    if (isOutOfStock) {
      throw OutOfStockSKUException;
    }
    // kiểm tra sản phẩm có bị xóa chưa
    const isExistingNotReadyProduct = cartItems.some(
      (item) =>
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        (item.sku.product.publishedAt !== null &&
          item.sku.product.publishedAt > new Date()),
    );
    if (isExistingNotReadyProduct) {
      throw NotFoundCartItemException;
    }

    // kiểm tra xem các sku trong cartItemIds có trong shopId ko
    const cartItemMap = new Map<number, (typeof cartItems)[0]>();
    cartItems.forEach((item) => cartItemMap.set(item.id, item));
    const isValidShop = body.every((item) => {
      const bodyCartitemIds = item.cartItemIds;
      return bodyCartitemIds.every((cartItemId) => {
        // nếu đã đến đâu thì cartItem luôn có giá trị
        // vì ta đã so sánh với allBodyCartItem.length trên'
        const cartItem = cartItemMap.get(cartItemId)!;
        return item.shopId === cartItem.sku.createdById;
      });
    });
    if (!isValidShop) {
      throw SKUNotBelongToShopException;
    }

    // tạo order
    const orders = await this.prismaService.$transaction(async (tx) => {
      const orders = await Promise.all(
        body.map((item) =>
          tx.order.create({
            data: {
              userId,
              status: OrderStatus.PENDING_PAYMENT,
              receiver: item.receiver,
              createdById: userId,
              shopId: item.shopId,
              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!;
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuId: cartItem.sku.id,
                    skuValue: cartItem.sku.value,
                    quantity: cartItem.quantity,
                    productId: cartItem.sku.product.id,
                    productTranslations:
                      cartItem.sku.product.productTranslations.map(
                        (translation) => {
                          return {
                            id: translation.id,
                            name: translation.name,
                            description: translation.description,
                            languageId: translation.languageId,
                          };
                        },
                      ),
                  };
                }),
              },
              products: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!;
                  return {
                    id: cartItem.sku.product.id,
                  };
                }),
              },
            },
          }),
        ),
      );
      await tx.cartItem.deleteMany({
        where: {
          id: {
            in: allBodyCartItemIds,
          },
        },
      });
      return orders;
    });
    return { data: orders };
  }

  async detail(
    userId: number,
    orderId: number,
  ): Promise<GetOrderDetailResType> {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });
    if (!order) {
      throw OrderNotFoundException;
    }
    return order;
  }
  async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    try {
      return this.prismaService.order.update({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        data: {
          status: OrderStatus.CANCELLED,
          updatedById: userId,
        },
      });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw OrderNotFoundException;
      throw error;
    }
  }
}
