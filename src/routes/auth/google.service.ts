import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { GoogleStateType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repo';
import { AuthService } from 'src/routes/auth/auth.service';
import envConfig from 'src/shared/config';
import { ShareRoleRepo } from 'src/shared/repositories/share-role.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly shareRoleRepo: ShareRoleRepo,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }
  getAuthorizationUrl({ userAgent, ip }: GoogleStateType) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString(
      'base64',
    );
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: stateString,
      include_granted_scopes: true,
    });
    return { url };
  }
  async googleCallback({ code, state }: { code: string; state: string }) {
    try {
      let userAgent = 'Unknown';
      let ip = 'Unknown';
      try {
        // giải mã cái state từ url
        if (state) {
          const clientInfo = JSON.parse(
            Buffer.from(state, 'base64').toString(),
          ) as GoogleStateType;
          userAgent = clientInfo.userAgent;
          ip = clientInfo.ip;
        }
      } catch (error) {
        console.log(error);
      }
      // dùng code để lấy tken
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      // lấy thông tin user
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });
      const { data } = await oauth2.userinfo.get();
      if (!data.email) {
        throw new Error('Email is required');
      }
      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      });
      // xác thực otp bước này
      if (!user) {
        // nguời mới => dnadwg kí
        const clientRoleId = await this.shareRoleRepo.getClientRoleId();
        const uuid = uuidv4();
        const hashedPassword = await this.hashingService.hash(uuid);
        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name ?? '',
          phoneNumber: '',
          password: hashedPassword,
          roleId: clientRoleId,
          avatar: data.picture ?? '',
        });
      }
      // taọ device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: userAgent,
        ip: ip,
      });
      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      });
      return authTokens;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
