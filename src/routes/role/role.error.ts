import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const RoleAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.RoleAlreadyExists',
    field: 'path',
  },
  {
    message: 'Error.RoleAlreadyExists',
    field: 'method',
  },
]);
export const ProhibitedDeletedRoleException = new ForbiddenException(
  'Error.ProhibitedDeletedRoleException',
);
