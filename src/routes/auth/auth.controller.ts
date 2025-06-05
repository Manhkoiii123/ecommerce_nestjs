/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  ForgotPasswordBodyDTO,
  GetOAuthAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO,
} from 'src/routes/auth/auth.dto';

import { AuthService } from 'src/routes/auth/auth.service';
import { GoogleService } from 'src/routes/auth/google.service';
import envConfig from 'src/shared/config';
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constants';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth, IsPublic } from 'src/shared/decorators/auth.decorator';
import { IP } from 'src/shared/decorators/ip.decorator';
import { UserArgent } from 'src/shared/decorators/user-argent.decorator';
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

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
  @Get('google/callback')
  @IsPublic()
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.googleService.googleCallback({ code, state });
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : error;
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?error=${message}`,
      );
    }
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  async forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return await this.authService.forgotPassword(body);
  }

  // truyền lên {} nhưng vẫn dùng post tại vì post mang ý tạo ra cái gì đó, Pót bảo mật hơn get
  // vì get có thể truy cập qua url trên trinhd duyệt
  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  @UseGuards(AccessTokenGuard)
  async setUpTwofactor(@ActiveUser('userId') userId: number) {
    return await this.authService.setUpTwofactor(userId);
  }
}
