import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {
  AddToCartBodyType,
  DeleteCartBodyType,
  UpdateCartItemBodyType,
} from 'src/routes/cart/cart.model';
import { CartRepository } from 'src/routes/cart/cart.repo';

@Injectable()
export class CartService {
  constructor(private readonly cartRepo: CartRepository) {}
  getCart(userId: number, query: { limit: number; page: number }) {
    return this.cartRepo.findAll({
      userId,
      languageId: I18nContext.current()?.lang as string,
      limit: query.limit,
      page: query.page,
    });
  }
  addToCart(userId: number, body: AddToCartBodyType) {
    return this.cartRepo.create(userId, body);
  }
  updateCart(cartItemId: number, body: UpdateCartItemBodyType) {
    return this.cartRepo.update(cartItemId, body);
  }
  async deleteCart(userId: number, body: DeleteCartBodyType) {
    const { count } = await this.cartRepo.delete(userId, body);
    return {
      message: `${count} items deleted successfully`,
    };
  }
}
