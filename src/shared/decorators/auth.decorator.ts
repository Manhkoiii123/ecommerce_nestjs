import { SetMetadata } from '@nestjs/common';
import {
  AuthTypeType,
  ConditionGuardType,
} from 'src/shared/constants/auth.constants';
export const AUTH_TYPE_KEY = 'auth_type';
export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[];
  options: { condition: ConditionGuardType };
};
export const Auth = (
  authTypes: AuthTypeType[],
  options: { condition: ConditionGuardType },
) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options });
};
