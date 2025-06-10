import { PermissionSchema } from 'src/routes/permission/permission.model';
import { RoleSchema } from 'src/routes/role/role.model';
import { z } from 'zod';
export const RolePermissioSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export type RolePermissionTypes = z.infer<typeof RolePermissioSchema>;
