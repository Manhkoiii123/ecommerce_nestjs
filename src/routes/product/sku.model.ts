import { z } from 'zod';
export const SKUSchema = z.object({
  id: z.number(),
  value: z.string(),
  productId: z.number(),
  price: z.number().positive(),
  stock: z.number().positive(),
  image: z.string(),
  createdById: z.number(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpsertSKUBodySchema = SKUSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
});

export type UpsertSKUBodyType = z.infer<typeof UpsertSKUBodySchema>;
export type SKUSchemaType = z.infer<typeof SKUSchema>;
