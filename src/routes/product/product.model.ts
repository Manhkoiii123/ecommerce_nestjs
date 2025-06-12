import { BrandIncludeTranslationSchema } from 'src/routes/brand/brand.model';
import { CategoryIncludeTranslationSchema } from 'src/routes/category/category.model';
import { ProductTranslationSchema } from 'src/routes/product/product-translation/product-translation.model';
import { SKUSchema, UpsertSKUBodySchema } from 'src/routes/product/sku.model';
import { z } from 'zod';
export function generateSkus(variants: VariantsType) {
  function getComninations(arrays: string[][]): string[] {
    return arrays.reduce(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)),
      [''],
    );
  }
  const options = variants.map((variant) => variant.options);
  const combinations = getComninations(options);
  return combinations.map((combination) => ({
    value: combination,
    price: 0,
    stock: 100,
    image: '',
  }));
}

export const VariantSchema = z.object({
  value: z.string(),
  options: z.array(z.string()),
});

export const VariantsSchema = z
  .array(VariantSchema)
  .superRefine((variants, ctx) => {
    // kiểm tra xem variant và variant option có bị trùng hay ko
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const isDifferent =
        variants.findIndex((v) => v.value === variant.value) !== i;
      if (!isDifferent) {
        return ctx.addIssue({
          code: 'custom',
          message: `Variant ${variant.value} value must be unique`,
          path: ['variants'],
        });
      }
      const isDifferentOption =
        variant.options.findIndex((o) => {
          variant.options.includes(o);
        }) !== -1;
      if (isDifferentOption) {
        return ctx.addIssue({
          code: 'custom',
          message: `Variant ${variant.value} options must be unique`,
          path: ['variants'],
        });
      }
    }
  });
export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.coerce.date().nullable(),
  name: z.string().max(500),
  base_price: z.number().positive(),
  virtual_price: z.number().positive(),
  brandId: z.number().positive(),
  images: z.array(z.string()),
  variants: VariantsSchema,
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1), // coerce chuyển từ str sang number
  limit: z.coerce.number().int().positive().default(10),
  name: z.string().optional(),
  brandIds: z.array(z.coerce.number().int().positive().optional()),
  categories: z.array(z.coerce.number().int().positive().optional()),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});
export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      processroductTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
  brand: BrandIncludeTranslationSchema,
});

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  base_price: true,
  virtual_price: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    // skus là cái gửi lên
    // so sánh cái gửi lên với cái generate có giống nhau ko
    const skuValueArray = generateSkus(variants);
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        message: `Skus length must be equal to variants length`,
        path: ['skus'],
      });
    }
    let wrongSKUIndex = -1;
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value;
      if (!isValid) {
        wrongSKUIndex = index;
      }
      return isValid;
    });
    if (!isValidSKUs) {
      return ctx.addIssue({
        code: 'custom',
        message: `Skus value ${wrongSKUIndex} must be equal to variants value`,
        path: ['skus'],
      });
    }
  });
export const UpdateProductBodySchema = CreateProductBodySchema;

export type ProductType = z.infer<typeof ProductSchema>;
export type VariantsType = z.infer<typeof VariantsSchema>;
export type GetProductsResType = z.infer<typeof GetProductsResSchema>;
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>;
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>;
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>;
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;
