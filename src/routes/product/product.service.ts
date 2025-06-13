import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {
  CreateProductBodyType,
  GetProductsQueryType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import { ProductRepository } from 'src/routes/product/product.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}
  async list(query: GetProductsQueryType) {
    const data = await this.productRepo.list(
      query,
      I18nContext.current()?.lang as string,
    );
    return data;
  }
  async findById(id: number) {
    const product = await this.productRepo.findById(
      id,
      I18nContext.current()?.lang as string,
    );
    if (!product) throw NotFoundRecordException;
    return product;
  }
  create({
    data,
    createdById,
  }: {
    createdById: number;
    data: CreateProductBodyType;
  }) {
    return this.productRepo.create({ data, createdById });
  }
  async update({
    id,
    updatedById,
    data,
  }: {
    id: number;
    updatedById: number;
    data: UpdateProductBodyType;
  }) {
    try {
      const p = this.productRepo.update({ id, updatedById, data });
      return p;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.productRepo.delete(id);
      return {
        message: 'Success.BrandDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
