import { RoleService } from 'src/routes/role/role.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import {
  CreateRoleBodyDTO,
  GetRoleDetailResDTO,
  GetRoleParamsDTO,
  GetRolesQueryDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO,
} from 'src/routes/role/role.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constants';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get()
  @ZodSerializerDto(GetRolesResDTO)
  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthenticationGuard)
  async list(@Query() query: GetRolesQueryDTO) {
    return this.roleService.list({
      page: query.page,
      limit: query.limit,
    });
  }
  @Get(':roleId')
  @ZodSerializerDto(GetRoleDetailResDTO)
  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthenticationGuard)
  @Auth([AuthType.Bearer, AuthType.ApiKey], { condition: ConditionGuard.Or })
  findById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.findById(params.roleId);
  }

  @Post()
  // @ZodSerializerDto(GetRoleDetailResDTO)
  @UseGuards(AccessTokenGuard)
  create(
    @Body() body: CreateRoleBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.roleService.create({
      data: body,
      createdById: userId,
    });
  }
  @Put(':roleId')
  @ZodSerializerDto(GetRoleDetailResDTO)
  @UseGuards(AccessTokenGuard)
  update(
    @Param() params: GetRoleParamsDTO,
    @ActiveUser('userId') userId: number,
    @Body() body: UpdateRoleBodyDTO,
  ) {
    return this.roleService.update({
      data: body,
      updatedById: userId,
      id: params.roleId,
    });
  }
  @Delete(':roleId')
  @ZodSerializerDto(MessageResDto)
  @UseGuards(AccessTokenGuard)
  delete(
    @ActiveUser('userId') userId: number,
    @Param() params: GetRoleParamsDTO,
  ) {
    return this.roleService.delete({ id: params.roleId, deletedById: userId });
  }
}
