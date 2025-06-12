import { UnprocessableEntityException } from '@nestjs/common';

export const CategoryTranslationAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: 'Error.CategoryTranslationAlreadyExists',
      field: 'name',
    },
  ]);
