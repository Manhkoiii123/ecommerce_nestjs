import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_ROLE_PERMISSION } from 'src/shared/constants/auth.constants';
import { RolePermissionTypes } from 'src/shared/models/share-role.model';

export const ActiveRolePermission = createParamDecorator(
  (field: keyof RolePermissionTypes | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const rolePermissions: RolePermissionTypes | undefined =
      request[REQUEST_ROLE_PERMISSION];
    return field ? rolePermissions?.[field] : rolePermissions;
  },
);
