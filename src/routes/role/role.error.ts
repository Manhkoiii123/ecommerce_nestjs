import { UnprocessableEntityException } from '@nestjs/common';

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
