import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const UserAlreadyExistException = new UnprocessableEntityException([
  {
    message: 'Error.UserAlreadyExists',
    field: 'email',
  },
]);

export const CannotUpdateAdminUserException = new ForbiddenException(
  'Error.CannotUpdateAdminUser',
);

export const CannotDeleteAdminUserException = new ForbiddenException(
  'Error.CannotDeleteAdminUser',
);

export const CannotSetAdminRoleToUserException = new ForbiddenException(
  'Error.CannotSetAdminRoleToUser',
);

export const RoleNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.RoleNotFound',
    field: 'RoleId',
  },
]);
