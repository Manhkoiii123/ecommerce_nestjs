/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
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

    let err = new UnauthorizedException('Invalid authentication guard');
    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const instance of guards) {
        const canActivate = await Promise.resolve(
          instance.canActivate(context),
        ).catch((error) => {
          err = error;
          return false;
        });
        if (canActivate) {
          return true;
        }
      }
      throw new UnauthorizedException('Invalid authentication guard');
    } else {
      for (const instance of guards) {
        const canActivate = await Promise.resolve(
          instance.canActivate(context),
        ).catch((error) => {
          err = error;
          return false;
        });
        if (!canActivate) {
          throw new UnauthorizedException('Invalid authentication guard');
        }
      }
      return true;
    }
  }
}
