/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constants';
import {
  AUTH_TYPE_KEY,
  AuthTypeDecoratorPayload,
} from 'src/shared/decorators/auth.decorator';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { ApiKeyGuard } from 'src/shared/guards/apiKey.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate> = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.ApiKey]: this.apiKeyGuard,
    [AuthType.None]: { canActivate: () => true },
  };
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // lấy ra cái tyoe ở cái @Auth([AuthType.Bearer, AuthType.ApiKey], { condition: ConditionGuard.Or })
    const authTypeValue = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      authTypes: [AuthType.Bearer], // nếu ko có default là [AuthType.Bearer]
      options: { condition: ConditionGuard.And },
    };
    // console.log(
    //   '🚀 ~ AuthenticationGuard ~ canActivate ~ authTypeValue:',
    //   authTypeValue, => { authTypes: [ 'Bearer', 'ApiKey' ], options: { condition: 'Or' } }
    // );

    const guards = authTypeValue.authTypes.map((type) => {
      return this.authTypeGuardMap[type];
    });
    return authTypeValue.options.condition === ConditionGuard.And
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context);
  }

  private async handleOrCondition(
    guards: CanActivate[],
    context: ExecutionContext,
  ) {
    let lastError: any = null;
    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) return true;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof HttpException) throw lastError;
    throw new UnauthorizedException('Invalid authentication guard');
  }

  private async handleAndCondition(
    guards: CanActivate[],
    context: ExecutionContext,
  ) {
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context)))
          throw new UnauthorizedException();
      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new UnauthorizedException();
      }
    }
    return true;
  }
}
