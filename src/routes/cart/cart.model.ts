import { ProductTranslationSchema } from 'src/routes/product/product-translation/product-translation.model';
import { ProductSchema } from 'src/routes/product/product.model';
import { SKUSchema } from 'src/routes/product/sku.model';
import { UserSchema } from 'src/shared/models/shared-user.model';
import { z } from 'zod';
export const CartItemSchema = z.object({
  id: z.number(),
  skuId: z.number(),
  quantity: z.number(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
});

export const CartItemDetailSchema = z.object({
  shop: UserSchema.pick({
    name: true,
    id: true,
    avatar: true,
  }).nullable(),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SKUSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(ProductTranslationSchema),
        }),
      }),
    }),
  ),
});

export const GetCartResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const AddToCartBodySchema = CartItemSchema.pick({
  skuId: true,
  quantity: true,
}).strict();

export const UpdateCartItemBodySchema = AddToCartBodySchema;
export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.coerce.number().int().positive()),
  })
  .strict();

export type CartItemType = z.infer<typeof CartItemSchema>;
export type GetCartItemParamType = z.infer<typeof GetCartItemParamsSchema>;
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>;
export type GetCartResType = z.infer<typeof GetCartResSchema>;
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>;
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>;
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>;
