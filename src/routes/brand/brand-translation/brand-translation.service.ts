import { Injectable } from '@nestjs/common';
import { BrandTranslationAlreadyExistsException } from 'src/routes/brand/brand-translation/brand-translation.error';
import {
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from 'src/routes/brand/brand-translation/brand-translation.model';
import { BrandTranslationRepo } from 'src/routes/brand/brand-translation/brand-translation.repo';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class BrandTranslationService {
  constructor(private readonly brandTranslationRepo: BrandTranslationRepo) {}

  async findById(id: number) {
    const brandTranslation = await this.brandTranslationRepo.findByid(id);
    if (!brandTranslation) throw NotFoundRecordException;
    return brandTranslation;
  }
  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandTranslationBodyType;
  }) {
    try {
      return this.brandTranslationRepo.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintError(error))
        throw BrandTranslationAlreadyExistsException;
      throw error;
    }
  }
  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateBrandTranslationBodyType;
    updatedById: number;
  }) {
    try {
      return this.brandTranslationRepo.update({ id, data, updatedById });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintError(error))
        throw BrandTranslationAlreadyExistsException;
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.brandTranslationRepo.delete(id);
      return {
        message: 'Success.BrandTranslationDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
