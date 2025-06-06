import { createZodDto } from 'nestjs-zod';
import {
  CreateLanguageBodySchema,
  GetLanguageDetailResSchema,
  GetLanguageParamsSchema,
  GetLanguageResSchema,
  UpdateLanguageBodySchema,
} from 'src/routes/language/language.model';

export class GetLanguagesResDTO extends createZodDto(GetLanguageResSchema) {}
export class GetLanguageParamsDTO extends createZodDto(
  GetLanguageParamsSchema,
) {}
export class GetLanguageDetailResDTO extends createZodDto(
  GetLanguageDetailResSchema,
) {}

export class CreateLanguageBodyDTO extends createZodDto(
  CreateLanguageBodySchema,
) {}
export class UpdateLanguageBodyDTO extends createZodDto(
  UpdateLanguageBodySchema,
) {}
