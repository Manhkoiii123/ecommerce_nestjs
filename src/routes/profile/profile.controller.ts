import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ChangePasswordBodyDTO } from 'src/routes/profile/profile.dto';
import { UpdateMeBodyType } from 'src/routes/profile/profile.model';
import { ProfileService } from 'src/routes/profile/profile.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import {
  GetUserProfileDTO,
  UpdateProfileDTO,
} from 'src/shared/dtos/shared-user.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { MessageResSchema } from 'src/shared/models/response.model';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileDTO)
  @UseGuards(AccessTokenGuard)
  async getProfile(@ActiveUser('userId') userId: number) {
    return await this.profileService.getProfile(userId);
  }

  @Put()
  @ZodSerializerDto(UpdateProfileDTO)
  @UseGuards(AccessTokenGuard)
  async updateProfile(
    @Body() body: UpdateMeBodyType,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.profileService.updateProfile({ userId, body });
  }
  @Put('change-password')
  @ZodSerializerDto(MessageResSchema)
  @UseGuards(AccessTokenGuard)
  async changePassword(
    @Body() body: ChangePasswordBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.profileService.changePassword({ userId, body });
  }
}
