import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constants';
import { AccessTokenPayload } from 'src/shared/types/jwt.type';

export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY] as AccessTokenPayload;
    return field ? user[field] : user;
  },
);
