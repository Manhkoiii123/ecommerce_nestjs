import { Injectable } from '@nestjs/common';
import { CategoryTranslationAlreadyExistsException } from 'src/routes/category/category-translation/category-translation.error';
import {
  CreateCategoryTranslationBodyType,
  UpdateCategoryTranslationBodyType,
} from 'src/routes/category/category-translation/category-translation.model';
import { CategoryTranslationRepo } from 'src/routes/category/category-translation/category-translation.repo';

import { NotFoundRecordException } from 'src/shared/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class CategoryTranslationService {
  constructor(
    private readonly categoryTranslationRepo: CategoryTranslationRepo,
  ) {}

  async findById(id: number) {
    const categoryTranslation = await this.categoryTranslationRepo.findByid(id);
    if (!categoryTranslation) throw NotFoundRecordException;
    return categoryTranslation;
  }
  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateCategoryTranslationBodyType;
  }) {
    try {
      return this.categoryTranslationRepo.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintError(error))
        throw CategoryTranslationAlreadyExistsException;
      throw error;
    }
  }
  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateCategoryTranslationBodyType;
    updatedById: number;
  }) {
    try {
      return this.categoryTranslationRepo.update({ id, data, updatedById });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintError(error))
        throw CategoryTranslationAlreadyExistsException;
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.categoryTranslationRepo.delete(id);
      return {
        message: 'Success.CategoryTranslationDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
