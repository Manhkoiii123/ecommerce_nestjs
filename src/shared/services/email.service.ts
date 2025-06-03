import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from 'src/shared/config';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }
  sendOTP(payload: { email: string; code: string }) {
    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      to: ['manhtranduc0202@gmail.com'], // sandbox chỉ dùng được cái này thôi
      subject: 'Verify your email address',
      html: `<strong>Your verification code is: ${payload.code}.</strong>`,
    });
  }
}
