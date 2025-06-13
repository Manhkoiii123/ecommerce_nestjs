import { UnprocessableEntityException } from '@nestjs/common';

export const ProductTranslationAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: 'Error.ProductTranslationAlreadyExistsException',
      field: 'name',
    },
  ]);
