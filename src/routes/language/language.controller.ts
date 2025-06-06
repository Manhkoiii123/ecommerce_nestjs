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
  CreateLanguageBodyDTO,
  GetLanguageDetailResDTO,
  GetLanguageParamsDTO,
  GetLanguagesResDTO,
} from 'src/routes/language/language.dto';
import { LanguageService } from 'src/routes/language/language.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ZodSerializerDto(GetLanguagesResDTO)
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  async findById(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.findById(params.languageId);
  }

  @Post()
  @ZodSerializerDto(GetLanguageDetailResDTO)
  @UseGuards(AccessTokenGuard)
  async create(
    @Body() body: CreateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  update(
    @Param() params: GetLanguageParamsDTO,
    @Body() body: CreateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.updateById({
      id: params.languageId,
      updatedById: userId,
      data: body,
    });
  }

  @Delete(':languageId')
  @ZodSerializerDto(MessageResDto)
  async delete(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.delete(params.languageId);
  }
}
