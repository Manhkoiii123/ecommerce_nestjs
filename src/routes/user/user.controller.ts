import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CreateUserResDTO,
  GetUserParamsDTO,
  GetUserQueryDTO,
  GetUserResDTO,
} from 'src/routes/user/user.dto';
import { CreateUserBodyType } from 'src/routes/user/user.model';
import { UserService } from 'src/routes/user/user.service';
import { ActiveRolePermission } from 'src/shared/decorators/active-role-permission.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { UpdateProfileDTO } from 'src/shared/dtos/shared-user.dto';
import { GetUserProfileResSchema } from 'src/shared/models/shared-user.model';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto(GetUserResDTO)
  async list(@Query() query: GetUserQueryDTO) {
    return this.userService.list({ page: query.page, limit: query.limit });
  }
  @Get(':userId')
  @ZodSerializerDto(GetUserProfileResSchema)
  async findById(@Param() params: GetUserParamsDTO) {
    return this.userService.findById(params.userId);
  }

  @Post()
  @ZodSerializerDto(CreateUserResDTO)
  create(
    @Body() body: CreateUserBodyType,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.create({
      data: body,
      createdById: userId,
      createdByRoleName: roleName,
    });
  }
  @Put(':userId')
  @ZodSerializerDto(UpdateProfileDTO)
  update(
    @Body() body: CreateUserBodyType,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
    @Param() params: GetUserParamsDTO,
  ) {
    return this.userService.update({
      data: body,
      id: params.userId,
      updateById: userId,
      updateByRoleName: roleName,
    });
  }
  @Delete(':userId')
  @ZodSerializerDto(MessageResDto)
  delete(
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
    @Param() params: GetUserParamsDTO,
  ) {
    return this.userService.delete({
      id: params.userId,
      deletedByRoleName: roleName,
    });
  }
}
