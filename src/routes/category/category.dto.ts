import { createZodDto } from 'nestjs-zod';
import {
  CreateCategoryBodySchema,
  GetAllCategoriesQuerySchema,
  GetAllCategoriesResSchema,
  GetCategoryDetailResSchema,
  GetCategoryParamsSchema,
  UpdateCategoryBodySchema,
} from 'src/routes/category/category.model';

export class GetAllCategoriesResDTO extends createZodDto(
  GetAllCategoriesResSchema,
) {}
export class GetCategoryParamsDTO extends createZodDto(
  GetCategoryParamsSchema,
) {}
export class GetAllCategoriesQueryDTO extends createZodDto(
  GetAllCategoriesQuerySchema,
) {}

export class GetCategoryDetailResDTO extends createZodDto(
  GetCategoryDetailResSchema,
) {}

export class CreateCategoryBodyDTO extends createZodDto(
  CreateCategoryBodySchema,
) {}
export class UpdateCategoryBodyDTO extends createZodDto(
  UpdateCategoryBodySchema,
) {}
