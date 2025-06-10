// các route cần đang nhập cần accToken

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  REQUEST_ROLE_PERMISSION,
  REQUEST_USER_KEY,
} from 'src/shared/constants/auth.constants';
import { HTTPMethod } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenPayload } from 'src/shared/types/jwt.type';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const decodedAccessToken = await this.extractAndValidateToken(request);
    await this.validateUserPermission(decodedAccessToken, request);
    return true;
  }

  private extractTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException("Missing 'Authorization' header");
    }

    return accessToken;
  }
  private async extractAndValidateToken(
    request: any,
  ): Promise<AccessTokenPayload> {
    const accessToken = this.extractTokenFromHeader(request);
    try {
      const decodeAccessToken =
        await this.tokenService.verifyAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decodeAccessToken;

      return decodeAccessToken;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async validateUserPermission(
    payload: AccessTokenPayload,
    request: any,
  ) {
    const roleId = payload.roleId;
    const path = request.route.path;
    const method = request.method as keyof typeof HTTPMethod;
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: { id: roleId, deletedAt: null },
        include: {
          permissions: {
            where: { deletedAt: null, path, method },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException('Forbidden');
      });

    const canAccess = role.permissions.some(
      (p) => p.method === method && p.path === path,
    );

    if (!canAccess) {
      throw new ForbiddenException('Forbidden');
    }
    request[REQUEST_ROLE_PERMISSION] = role;
  }
}
