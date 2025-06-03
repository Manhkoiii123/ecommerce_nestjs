import { createZodDto } from 'nestjs-zod';
import {
  LoginBodySchema,
  LoginResSchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOtpBodySchema,
} from 'src/routes/auth/auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOtpBodySchema) {}
