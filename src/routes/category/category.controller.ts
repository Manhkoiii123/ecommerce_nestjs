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
  CreateCategoryBodyDTO,
  GetAllCategoriesQueryDTO,
  GetAllCategoriesResDTO,
  GetCategoryDetailResDTO,
  GetCategoryParamsDTO,
  UpdateCategoryBodyDTO,
} from 'src/routes/category/category.dto';
import { CategoryService } from 'src/routes/category/category.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  @IsPublic()
  @ZodSerializerDto(GetAllCategoriesResDTO)
  findAll(@Query() query: GetAllCategoriesQueryDTO) {
    return this.categoryService.findAll(query.parentCategoryId);
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById(params.categoryId);
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  @UseGuards(AccessTokenGuard)
  create(
    @Body() body: CreateCategoryBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':categoryId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(GetCategoryDetailResDTO)
  update(
    @Body() body: UpdateCategoryBodyDTO,
    @Param() params: GetCategoryParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.update({
      data: body,
      id: params.categoryId,
      updatedById: userId,
    });
  }

  @Delete(':categoryId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.delete(params.categoryId);
  }
}
