import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {
  CreateCategoryBodyType,
  UpdateCategoryBodyType,
} from 'src/routes/category/category.model';
import { CategoryRepository } from 'src/routes/category/category.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}
  async findAll(parentCategoryId: number | undefined) {
    return this.categoryRepo.findAll({
      parentCategoryId,
      languageId: I18nContext.current()?.lang as string,
    });
  }
  async findById(id: number) {
    const category = await this.categoryRepo.findById({
      id,
      languageId: I18nContext.current()?.lang as string,
    });
    if (!category) throw NotFoundRecordException;
    return category;
  }
  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateCategoryBodyType;
  }) {
    return this.categoryRepo.create({ createdById, data });
  }
  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateCategoryBodyType;
    updatedById: number;
  }) {
    try {
      return this.categoryRepo.update({ id, data, updatedById });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.categoryRepo.delete(id);
      return {
        message: 'Success.BrandDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
