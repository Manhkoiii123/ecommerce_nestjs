import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartItemParamsDTO,
  GetCartResDTO,
  UpdateCartItemBodyDTO,
} from 'src/routes/cart/cart.dto';
import { CartService } from 'src/routes/cart/cart.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDto } from 'src/shared/dtos/response.dto';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';

@Controller('cart')
@UseGuards(AccessTokenGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  @ZodSerializerDto(GetCartResDTO)
  getCart(
    @ActiveUser('userId') userId: number,
    @Query() query: { limit: number; page: number },
  ) {
    return this.cartService.getCart(userId, query);
  }

  @Post()
  @ZodSerializerDto(CartItemDTO)
  addToCart(
    @Body() body: AddToCartBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.cartService.addToCart(userId, body);
  }

  @Put(':cartItemId')
  @ZodSerializerDto(CartItemDTO)
  updateCartItem(
    @Param() param: GetCartItemParamsDTO,
    @Body() body: UpdateCartItemBodyDTO,
  ) {
    return this.cartService.updateCart(param.cartItemId, body);
  }

  @Post('delete')
  @ZodSerializerDto(MessageResDto)
  deleteCart(
    @Body() body: DeleteCartBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.cartService.deleteCart(userId, body);
  }
}
