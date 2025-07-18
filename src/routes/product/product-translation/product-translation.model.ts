import { z } from 'zod';
export const ProductTranslationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  languageId: z.string(),
  name: z.string().max(500),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetProductTranslationParamsSchema = z
  .object({
    productTranslationId: z.coerce.number().int().positive(),
  })
  .strict();
export const GetProductTranslationDetailResSchema = ProductTranslationSchema;

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick(
  {
    productId: true,
    languageId: true,
    name: true,
    description: true,
  },
).strict();

export const UpdateProductTranslationBodySchema =
  CreateProductTranslationBodySchema;

export const DeleteProductTranslationBodySchema =
  GetProductTranslationParamsSchema;

export type ProductTranslationType = z.infer<typeof ProductTranslationSchema>;

export type GetProductTranslationParamsType = z.infer<
  typeof GetProductTranslationParamsSchema
>;

export type GetProductTranslationDetailResType = z.infer<
  typeof GetProductTranslationDetailResSchema
>;
export type CreateProductTranslationBodyType = z.infer<
  typeof CreateProductTranslationBodySchema
>;

export type UpdateProductTranslationBodyType = z.infer<
  typeof UpdateProductTranslationBodySchema
>;

export type DeleteProductTranslationBodyType = z.infer<
  typeof DeleteProductTranslationBodySchema
>;
