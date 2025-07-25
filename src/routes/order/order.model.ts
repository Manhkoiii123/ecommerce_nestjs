import { OrderStatus } from 'src/shared/constants/order.constants';
import { z } from 'zod';
const OrderStatusSchema = z.enum([
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
  OrderStatus.PENDING_DELIVERY,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.RETURNED,
]);

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: OrderStatusSchema,
  receiver: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  shopId: z.number().nullable(),
  paymentId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  productName: z.string(),
  productTranslations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      languageId: z.string(),
    }),
  ),
  skuPrice: z.number(),
  image: z.string(),
  skuValue: z.string(),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  quantity: z.number(),

  createdAt: z.date(),
});
export const GetOrderListResSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    }).omit({
      receiver: true,
      deletedAt: true,
      deletedById: true,
      createdById: true,
      updatedById: true,
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetOrderListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    status: OrderStatusSchema.optional(),
  })
  .strict();

export const GetOrderDetailResSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
});

export const CreateOrderBodySchema = z
  .array(
    z.object({
      shopId: z.number(),
      receiver: z.object({
        name: z.string(),
        phone: z.string(),
        address: z.string(),
      }),
      cartItemIds: z.array(z.number()).min(1),
    }),
  )
  .min(1);

export const CreateOrderResSchema = z.object({
  data: z.array(OrderSchema),
});
export const CancelOrderResSchema = OrderSchema;

export const GetOrderParamsSchema = z
  .object({
    orderId: z.coerce.number().int().positive(),
  })
  .strict();

export const OrderIncludeProductSKUSnapshotSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
});
export type OrderIncludeProductSKUSnapshotType = z.infer<
  typeof OrderIncludeProductSKUSnapshotSchema
>;
export type GetOrderListResType = z.infer<typeof GetOrderListResSchema>;
export type GetOrderListQueryType = z.infer<typeof GetOrderListQuerySchema>;
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>;
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>;
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>;
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>;
export type CancelOrderResType = z.infer<typeof CancelOrderResSchema>;

export type OrderType = z.infer<typeof OrderSchema>;
