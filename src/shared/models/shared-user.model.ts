// tách nó ra để cái trong shared cũng dùng được cái này chứ ko import lẫn lộn share với auth

import { PermissionSchema } from 'src/routes/permission/permission.model';
import { RoleSchema } from 'src/routes/role/role.model';
import { UserStatus } from 'src/shared/constants/auth.constants';
import { z } from 'zod';
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phoneNumber: z.string().min(10).max(15),
  password: z.string().min(6).max(100),
  avatar: z.string().nullable(),
  status: z.nativeEnum(UserStatus),
  totpSecret: z.string().nullable(),
  roleId: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
});

export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true,
      }),
    ),
  }),
});
export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>;
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;
export type UserType = z.infer<typeof UserSchema>;
