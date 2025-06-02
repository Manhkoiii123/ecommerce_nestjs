import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) =>
    new UnprocessableEntityException(
      error.errors.map((e) => {
        return {
          ...e,
          path: e.path.join('.'),
        };
      }),
    ),
});

export default CustomZodValidationPipe;
