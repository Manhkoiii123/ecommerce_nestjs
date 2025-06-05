import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants';
import { UserSchema } from 'src/shared/models/shared-user.model';
import { z } from 'zod';

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    totpCode: z.string().length(6).optional(), // 2fa
    code: z.string().length(6).optional(), // otp code
  })
  .strict();
export type LoginBodyType = z.infer<typeof LoginBodySchema>;

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type LoginResType = z.infer<typeof LoginResSchema>;

export type RegisterResType = z.infer<typeof RegisterResSchema>;

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export const RefreshTokenResSchema = LoginResSchema;
export type RefreshTokenResType = LoginResType;
// khai baso schema vericartion code
export const VerificationCode = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type VerificationCodeType = z.infer<typeof VerificationCode>;
export const SendOtpBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict();
export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export type DeviceType = z.infer<typeof DeviceSchema>;
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RoleType = z.infer<typeof RoleSchema>;

export const RefershTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  expiresAt: z.date(),
  deviceId: z.number(),
  createdAt: z.date(),
});

export type RefreshTokenType = z.infer<typeof RefershTokenSchema>;

export const LogoutBodySchema = RefreshTokenBodySchema;
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>;

export const GoogleStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
});
export type GoogleStateType = z.infer<typeof GoogleStateSchema>;

export const GetOAuthAuthorizationUrlResSchema = z.object({
  url: z.string(),
});

export type GetOAuthAuthorizationUrlResType = z.infer<
  typeof GetOAuthAuthorizationUrlResSchema
>;

export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmNewPassword'],
      });
    }
  });

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;

export const DisableTwoFactorBodySchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .superRefine(({ totpCode, code }, ctx) => {
    if ((totpCode !== undefined) === (code !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cannot use both totpCode and code',
        path: ['totpCode'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'Cannot use both totpCode and code',
        path: ['code'],
      });
    }
  });

export type DisableTwoFactorBodyType = z.infer<
  typeof DisableTwoFactorBodySchema
>;

export const TwoFactorSetupResSchema = z.object({
  secret: z.string(),
  uri: z.string(),
});
export type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>;
