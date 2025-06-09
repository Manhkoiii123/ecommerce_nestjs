import { createZodDto } from 'nestjs-zod';
import {
  GetUserProfileResSchema,
  UpdateProfileResSchema,
} from 'src/shared/models/shared-user.model';

export class GetUserProfileDTO extends createZodDto(GetUserProfileResSchema) {}
export class UpdateProfileDTO extends createZodDto(UpdateProfileResSchema) {}
