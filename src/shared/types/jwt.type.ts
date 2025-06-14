export interface TokenPayload {
  userId: number;
  iat: number;
  exp: number;
}
export interface AccessTokenPayloadCreate {
  userId: number;
  deviceId: number;
  roleId: number;
  roleName: string;
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  iat: number;
  exp: number;
}

export interface RefreshTokenPayloadCreate {
  userId: number;
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  iat: number;
  exp: number;
}
