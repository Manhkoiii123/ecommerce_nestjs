import { createZodDto } from 'nestjs-zod';
import {
  CreateRoleBodySchema,
  GetRoleDetailResSchema,
  GetRoleParamsSchema,
  GetRolesQuerySchema,
  GetRolesResSchema,
  UpdateRoleBodySchema,
} from 'src/routes/role/role.model';

export class GetRolesResDTO extends createZodDto(GetRolesResSchema) {}
export class GetRoleParamsDTO extends createZodDto(GetRoleParamsSchema) {}
export class GetRolesQueryDTO extends createZodDto(GetRolesQuerySchema) {}

export class GetRoleDetailResDTO extends createZodDto(GetRoleDetailResSchema) {}

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}
export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}
