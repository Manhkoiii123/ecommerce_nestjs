import { RoleSchema } from 'src/routes/role/role.model';
import { UserSchema } from 'src/shared/models/shared-user.model';
import { z } from 'zod';
export const GetUserResSChema = z.object({
  data: z.array(
    UserSchema.omit({ password: true, totpSecret: true }).extend({
      role: RoleSchema.pick({ id: true, name: true }),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetUserQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();

export const GetUserParamsSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict();

export const CreateUserBodySchema = UserSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  password: true,
  avatar: true,
  status: true,
  roleId: true,
}).strict();

export const UpdateUserBodySchema = CreateUserBodySchema;

export type GetUsersResType = z.infer<typeof GetUserResSChema>;
export type GetUserQueryType = z.infer<typeof GetUserQuerySchema>;
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>;
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
