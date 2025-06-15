import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { GetProductsQueryType } from 'src/routes/product/product.model';
import { ProductRepository } from 'src/routes/product/product.repo';
import { NotFoundRecordException } from 'src/shared/error';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}
  async list(props: { query: GetProductsQueryType }) {
    const data = await this.productRepo.list({
      page: props.query.page,
      limit: props.query.limit,
      languageId: I18nContext.current()?.lang as string,
      isPublic: true,
      name: props.query.name,
      brandIds: props.query.brandIds,
      categories: props.query.categories,
      minPrice: props.query.minPrice,
      maxPrice: props.query.maxPrice,
      createdbyId: props.query.createdById,
      orderBy: props.query.orderBy,
      sortBy: props.query.sortBy,
    });
    return data;
  }
  async getDetail(props: { productId: number }) {
    const product = await this.productRepo.getDetail({
      productId: props.productId,
      languageId: I18nContext.current()?.lang as string,
      isPublic: true,
    });
    if (!product) throw NotFoundRecordException;
    return product;
  }
}
