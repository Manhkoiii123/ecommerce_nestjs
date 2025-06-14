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
import { ManageProductService } from 'src/routes/product/manager-product.service';
import {
  CreateProductBodyDTO,
  GetManagerProductsQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/routes/product/product.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { AccessTokenPayload } from 'src/shared/types/jwt.type';

@Controller('manage-product/products')
@UseGuards(AccessTokenGuard)
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}
  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  async list(
    @Query() query: GetManagerProductsQueryDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    return this.manageProductService.list({
      query,
      userIdRequest: user.userId,
      roleName: user.roleName,
    });
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  async findById(
    @Param() param: GetProductParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    return this.manageProductService.findById({
      productId: param.productId,
      userIdRequest: user.userId,
      roleName: user.roleName,
    });
  }
  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  async create(
    @Body() body: CreateProductBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.manageProductService.create({
      data: body,
      createdById: userId,
    });
  }
  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  update(
    @Body() body: UpdateProductBodyDTO,
    @Param() params: GetProductParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    return this.manageProductService.update({
      data: body,
      productId: params.productId,
      updatedById: user.userId,
      roleName: user.roleName,
    });
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDto)
  delete(
    @Param() params: GetProductParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    return this.manageProductService.delete(
      params.productId,
      user.roleName,
      user.userId,
    );
  }
}
