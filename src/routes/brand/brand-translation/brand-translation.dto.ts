import { createZodDto } from 'nestjs-zod';
import {
  CreateBrandTranslationBodySchema,
  GetBrandTranslationDetailResSchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from 'src/routes/brand/brand-translation/brand-translation.model';

export class GetBrandTranslationParamsDTO extends createZodDto(
  GetBrandTranslationParamsSchema,
) {}

export class GetBrandTranslationDetailResDTO extends createZodDto(
  GetBrandTranslationDetailResSchema,
) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(
  CreateBrandTranslationBodySchema,
) {}
export class UpdateBrandTranslationBodyDTO extends createZodDto(
  UpdateBrandTranslationBodySchema,
) {}
