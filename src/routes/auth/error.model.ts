import {
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const InvalidOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidOTP',
    path: 'code',
  },
]);

export const OTPExpiredException = new UnprocessableEntityException([
  {
    message: 'Error.OTPExpired',
    path: 'code',
  },
]);

export const FaildedToSendOTPException = new UnprocessableEntityException([
  {
    message: 'Error.FaildedToSendOTP',
    path: 'email',
  },
]);
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.EmailAlreadyExists',
    path: 'refreshToken',
  },
]);
export const EmailNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.EmailNotFound',
    path: 'refreshToken',
  },
]);
export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidPassword',
    path: 'refreshToken',
  },
]);
export const RefreshTokenAlreadyUsedException = new UnauthorizedException(
  'Error.RefreshTokenAlreadyUsed',
);
export const UnauthorizedAccessException = new UnauthorizedException(
  'Error.UnauthorizedAccess',
);

export const GoogleUserInfoException = new Error(
  'Error.FailedToGoogleUserInfo',
);
export const TOTPAlreadyEnabledException = new UnprocessableEntityException([
  {
    message: 'Error.TOTPAlreadyEnabled',
    path: 'totpCode',
  },
]);

export const TOTPNotEnabledException = new UnprocessableEntityException([
  {
    message: 'Error.TOTPNotEnabled',
    path: 'totpCode',
  },
]);

export const InvalidTOTPAndCodeException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTPAndCode',
    path: 'totpCode',
  },
  {
    message: 'Error.InvalidTOTPAndCode',
    path: 'code',
  },
]);

export const InvalidTOTPCodeException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTPCode',
    path: 'totpCode',
  },
]);
