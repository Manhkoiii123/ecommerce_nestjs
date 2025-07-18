import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CreateBrandTranslationBodyDTO,
  GetBrandTranslationDetailResDTO,
  GetBrandTranslationParamsDTO,
  UpdateBrandTranslationBodyDTO,
} from 'src/routes/brand/brand-translation/brand-translation.dto';
import { BrandTranslationService } from 'src/routes/brand/brand-translation/brand-translation.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('brand-translations')
export class BrandTranslationController {
  constructor(
    private readonly brandTranslationService: BrandTranslationService,
  ) {}

  @Get(':brandTranslationId')
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  findById(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.findById(params.brandTranslationId);
  }

  @Post()
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  @UseGuards(AccessTokenGuard)
  create(
    @Body() body: CreateBrandTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':brandTranslationId')
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  update(
    @Body() body: UpdateBrandTranslationBodyDTO,
    @Param() params: GetBrandTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.update({
      data: body,
      id: params.brandTranslationId,
      updatedById: userId,
    });
  }

  @Delete(':brandTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.delete(params.brandTranslationId);
  }
}
