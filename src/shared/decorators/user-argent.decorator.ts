import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserArgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): String => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
  },
);
