import { Injectable } from '@nestjs/common';
import { ProductTranslationAlreadyExistsException } from 'src/routes/product/product-translation/product-translation.error';
import {
  CreateProductTranslationBodyType,
  UpdateProductTranslationBodyType,
} from 'src/routes/product/product-translation/product-translation.model';
import { ProductTranslationRepository } from 'src/routes/product/product-translation/product-translation.repo';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class ProductTranslationService {
  constructor(
    private readonly productTranslationRepo: ProductTranslationRepository,
  ) {}
  async findById(id: number) {
    const productTranslation = await this.productTranslationRepo.findById(id);
    if (!productTranslation) throw NotFoundRecordException;
    return productTranslation;
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateProductTranslationBodyType;
    createdById: number;
  }) {
    try {
      return await this.productTranslationRepo.create({ data, createdById });
    } catch (error) {
      if (isUniqueConstraintError(error))
        throw ProductTranslationAlreadyExistsException;
      throw error;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateProductTranslationBodyType;
    updatedById: number;
  }) {
    try {
      const product = await this.productTranslationRepo.update({
        id,
        updatedById,
        data,
      });
      return product;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.productTranslationRepo.delete(id);
      return {
        message: 'Success.BrandDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
