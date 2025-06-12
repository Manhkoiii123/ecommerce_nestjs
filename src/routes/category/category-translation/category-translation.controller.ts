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
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from 'src/routes/category/category-translation/category-translation.dto';
import { CategoryTranslationService } from 'src/routes/category/category-translation/category-translation.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('category-translations')
export class CategoryTranslationController {
  constructor(
    private readonly categoryTranslationService: CategoryTranslationService,
  ) {}

  @Get(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(
      params.categoryTranslationId,
    );
  }

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  @UseGuards(AccessTokenGuard)
  create(
    @Body() body: CreateCategoryTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  update(
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @Param() params: GetCategoryTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.update({
      data: body,
      id: params.categoryTranslationId,
      updatedById: userId,
    });
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.delete(params.categoryTranslationId);
  }
}
