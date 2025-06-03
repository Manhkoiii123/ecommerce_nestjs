import { createZodDto } from 'nestjs-zod';
import {
  RegisterBodySchema,
  RegisterResSchema,
  SendOtpBodySchema,
} from 'src/routes/auth/auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOtpBodySchema) {}
