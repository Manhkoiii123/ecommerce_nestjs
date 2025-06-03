/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  LoginBodyDTO,
  LoginResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
} from 'src/routes/auth/auth.dto';

import { AuthService } from 'src/routes/auth/auth.service';
import { IP } from 'src/shared/decorators/ip.decorator';
import { UserArgent } from 'src/shared/decorators/user-argent.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body);
  }

  @Post('send-otp')
  async sendOtp(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOtp(body);
  }

  @Post('login')
  @ZodSerializerDto(LoginResDTO)
  login(
    @Body() body: LoginBodyDTO,
    @UserArgent() userAgent: string,
    @IP() ip: string,
  ) {
    return this.authService.login({ ...body, userAgent, ip });
  }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Body() body: any) {
  //   return await this.authService.refreshToken(body.refreshToken);
  // }

  // @Post('logout')
  // async logout(@Body() body: any) {
  //   return await this.authService.logout(body.refreshToken);
  // }
}
