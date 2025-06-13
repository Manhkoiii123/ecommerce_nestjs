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
  CreateProductBodyDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/routes/product/product.dto';
import { ProductService } from 'src/routes/product/product.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Get()
  @IsPublic()
  @ZodSerializerDto(GetProductsResDTO)
  async list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list(query);
  }

  @Get(':productId')
  @IsPublic()
  @ZodSerializerDto(GetProductDetailResDTO)
  async findById(@Param() param: GetProductParamsDTO) {
    return this.productService.findById(param.productId);
  }
  @Post()
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(GetProductDetailResDTO)
  async create(
    @Body() body: CreateProductBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productService.create({
      data: body,
      createdById: userId,
    });
  }
  @Put(':productId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(ProductDTO)
  update(
    @Body() body: UpdateProductBodyDTO,
    @Param() params: GetProductParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productService.update({
      data: body,
      id: params.productId,
      updatedById: userId,
    });
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetProductParamsDTO) {
    return this.productService.delete(params.productId);
  }
}
