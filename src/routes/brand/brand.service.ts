import { Injectable } from '@nestjs/common';
import {
  CreateBrandBodyType,
  GetBrandsQueryType,
} from 'src/routes/brand/brand.model';
import { BrandRepo } from 'src/routes/brand/brand.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepo) {}
  async list(pagination: GetBrandsQueryType, languageId?: string) {
    return this.brandRepo.list(pagination, languageId);
  }
  async findById(id: number, languageId?: string) {
    const brand = await this.brandRepo.findById(id, languageId);
    if (!brand) throw NotFoundRecordException;
    return brand;
  }
  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandBodyType;
  }) {
    return this.brandRepo.create({ createdById, data });
  }
  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: CreateBrandBodyType;
    updatedById: number;
  }) {
    try {
      return this.brandRepo.update({ id, data, updatedById });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.brandRepo.delete(id);
      return {
        message: 'Success.BrandDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
