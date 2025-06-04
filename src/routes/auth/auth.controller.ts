/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  GetOAuthAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
} from 'src/routes/auth/auth.dto';

import { AuthService } from 'src/routes/auth/auth.service';
import { GoogleService } from 'src/routes/auth/google.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { IP } from 'src/shared/decorators/ip.decorator';
import { UserArgent } from 'src/shared/decorators/user-argent.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}
  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body);
  }

  @Post('send-otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  async sendOtp(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOtp(body);
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  login(
    @Body() body: LoginBodyDTO,
    @UserArgent() userAgent: string,
    @IP() ip: string,
  ) {
    return this.authService.login({ ...body, userAgent, ip });
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(
    @Body() body: RefreshTokenBodyDTO,
    @UserArgent() userAgent: string,
    @IP() ip: string,
  ) {
    return await this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    });
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDto)
  async logout(@Body() body: LogoutBodyDTO) {
    return await this.authService.logout(body.refreshToken);
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetOAuthAuthorizationUrlResDTO)
  getAuthorizationUrl(@UserArgent() userAgent: string, @IP() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip });
  }
}
