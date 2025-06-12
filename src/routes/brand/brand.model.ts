import { BrandTranslationSchema } from 'src/routes/brand/brand-translation/brand-translation.model';
import { z } from 'zod';
export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().url().max(1000),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const BrandIncludeTranslationSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});

export const GetBrandsResSchema = z.object({
  data: z.array(BrandIncludeTranslationSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export const GetBrandsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1), // coerce chuyển từ str sang number
    limit: z.coerce.number().int().positive().default(10),
    lang: z.string().optional(),
  })
  .strict();
export const GetBrandParamsSchema = z
  .object({
    brandId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetBrandDetailResSchema = BrandIncludeTranslationSchema;

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict();

export const UpdateBrandBodySchema = CreateBrandBodySchema;

export type BrandType = z.infer<typeof BrandSchema>;
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>;
export type GetBrandDetailResType = z.infer<typeof GetBrandDetailResSchema>;
export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>;

export type BrandIncludeTranslationType = z.infer<
  typeof BrandIncludeTranslationSchema
>;

export type GetBrandsQueryType = z.infer<typeof GetBrandsQuerySchema>;
