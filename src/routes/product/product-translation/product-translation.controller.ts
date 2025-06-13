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
  CreateProductTranslationBodyDTO,
  GetProductTranslationDetailResDTO,
  GetProductTranslationParamsDTO,
  UpdateProductTranslationBodyDTO,
} from 'src/routes/product/product-translation/product-translation.dto';
import { ProductTranslationService } from 'src/routes/product/product-translation/product-translation.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('product-translations')
export class ProductTranslationController {
  constructor(
    private readonly productTranslationService: ProductTranslationService,
  ) {}
  @Get(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  async findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  create(
    @Body() body: CreateProductTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':productTranslationId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  update(
    @Body() body: UpdateProductTranslationBodyDTO,
    @Param() params: GetProductTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.update({
      data: body,
      id: params.productTranslationId,
      updatedById: userId,
    });
  }

  @Delete(':productTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.delete(params.productTranslationId);
  }
}
