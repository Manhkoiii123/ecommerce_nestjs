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
import {
  CreatePermissionBodyDTO,
  GetPermissionDetailResDTO,
  GetPermissionParamsDTO,
  GetPermissionsQueryDTO,
  GetPermissionsResDTO,
} from 'src/routes/permission/permission.dto';
import { PermissionService } from 'src/routes/permission/permission.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Get()
  @ZodSerializerDto(GetPermissionsResDTO)
  async list(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.list({
      page: query.page,
      limit: query.limit,
    });
  }
  @Get(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  findById(@Param() params: GetPermissionParamsDTO) {
    return this.permissionService.findById(params.permissionId);
  }

  @Post()
  @ZodSerializerDto(GetPermissionDetailResDTO)
  @UseGuards(AccessTokenGuard)
  create(
    @Body() body: CreatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.create({
      data: body,
      createdById: userId,
    });
  }
  @Put(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  @UseGuards(AccessTokenGuard)
  update(
    @Body() body: CreatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
    @Param() params: GetPermissionParamsDTO,
  ) {
    return this.permissionService.update({
      data: body,
      updatedById: userId,
      id: params.permissionId,
    });
  }
  @Delete(':permissionId')
  @ZodSerializerDto(MessageResDto)
  @UseGuards(AccessTokenGuard)
  delete(
    @Param() params: GetPermissionParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.delete(params.permissionId, userId);
  }
}
