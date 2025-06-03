import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from 'src/shared/config';
import fs from 'fs';
import path from 'path';
@Injectable()
export class EmailService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }
  sendOTP(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(
      path.resolve('src/shared/email-templates/otp.html'),
      {
        encoding: 'utf-8',
      },
    );

    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      to: ['manhtranduc0202@gmail.com'], // sandbox chỉ dùng được cái này thôi
      subject: 'Verify your email address',
      html: otpTemplate
        .replaceAll('{{code}}', payload.code)
        .replaceAll('{{email}}', payload.email),
    });
  }
}
