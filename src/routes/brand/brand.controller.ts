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
  CreateBrandBodyDTO,
  GetBrandDetailResDTO,
  GetBrandParamsDTO,
  GetBrandsQueryDTO,
  GetBrandsResDTO,
  UpdateBrandBodyDTO,
} from 'src/routes/brand/brand.dto';
import { BrandService } from 'src/routes/brand/brand.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @Get()
  @IsPublic()
  @ZodSerializerDto(GetBrandsResDTO)
  async list(@Query() query: GetBrandsQueryDTO) {
    return this.brandService.list({ page: query.page, limit: query.limit });
  }

  @Get(':brandId')
  @IsPublic()
  @ZodSerializerDto(GetBrandDetailResDTO)
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params.brandId);
  }

  @Post()
  @ZodSerializerDto(GetBrandDetailResDTO)
  @UseGuards(AccessTokenGuard)
  create(
    @Body() body: CreateBrandBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandService.create({
      data: body,
      createdById: userId,
    });
  }
  @Put(':brandId')
  @ZodSerializerDto(GetBrandDetailResDTO)
  update(
    @Body() body: UpdateBrandBodyDTO,
    @ActiveUser('userId') userId: number,
    @Param() params: GetBrandParamsDTO,
  ) {
    return this.brandService.update({
      data: body,
      updatedById: userId,
      id: params.brandId,
    });
  }

  @Delete(':brandId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetBrandParamsDTO) {
    return this.brandService.delete(params.brandId);
  }
}
