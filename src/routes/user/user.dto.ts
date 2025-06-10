import { createZodDto } from 'nestjs-zod';
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUserQuerySchema,
  GetUserResSChema,
  UpdateUserBodySchema,
} from 'src/routes/user/user.model';
import { UpdateProfileDTO } from 'src/shared/dtos/shared-user.dto';

export class GetUserResDTO extends createZodDto(GetUserResSChema) {}
export class GetUserQueryDTO extends createZodDto(GetUserQuerySchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class CreateUserResDTO extends UpdateProfileDTO {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
