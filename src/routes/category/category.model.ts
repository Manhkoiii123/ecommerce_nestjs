import { CategoryTranslationSchema } from 'src/routes/category/category-translation/category-translation.model';
import { z } from 'zod';
export const CategorySchema = z.object({
  id: z.number(),
  parentCategoryId: z.number().nullable(),
  name: z.string().max(500),
  logo: z.string().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CategoryIncludeTranslationSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
});

export const GetAllCategoriesResSchema = z.object({
  data: z.array(CategorySchema),
  totalItems: z.number(),
});

export const GetAllCategoriesQuerySchema = z.object({
  parentCategoryId: z.coerce.number().int().positive().optional(),
});
export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetCategoryDetailResSchema = CategoryIncludeTranslationSchema;

export const CreateCategoryBodySchema = CategorySchema.pick({
  parentCategoryId: true,
  name: true,
  logo: true,
}).strict();

export const UpdateCategoryBodySchema = CreateCategoryBodySchema;

export type CategoryType = z.infer<typeof CategorySchema>;

export type CategoryIncludeTranslationType = z.infer<
  typeof CategoryIncludeTranslationSchema
>;

export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;

export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;

export type GetAllCategoriesQueryType = z.infer<
  typeof GetAllCategoriesQuerySchema
>;

export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>;

export type GetCategoryDetailResType = z.infer<
  typeof GetCategoryDetailResSchema
>;

export type GetAllCategoriesResType = z.infer<typeof GetAllCategoriesResSchema>;
