import { createZodDto } from 'nestjs-zod';
import {
  DisableTwoFactorBodySchema,
  ForgotPasswordBodySchema,
  GetOAuthAuthorizationUrlResSchema,
  LoginBodySchema,
  LoginResSchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOtpBodySchema,
  TwoFactorSetupResSchema,
} from 'src/routes/auth/auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOtpBodySchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}
export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}

export class GetOAuthAuthorizationUrlResDTO extends createZodDto(
  GetOAuthAuthorizationUrlResSchema,
) {}

export class ForgotPasswordBodyDTO extends createZodDto(
  ForgotPasswordBodySchema,
) {}

export class TwoFactorSetupResDTO extends createZodDto(
  TwoFactorSetupResSchema,
) {}
export class DisableTwoFactorBodyDTO extends createZodDto(
  DisableTwoFactorBodySchema,
) {}
