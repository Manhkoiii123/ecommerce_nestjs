import { Injectable } from '@nestjs/common';
import { LanguageAlreadyExistsException } from 'src/routes/language/language.error';
import { CreateLanguageBodyType } from 'src/routes/language/language.model';
import { LanguageRepo } from 'src/routes/language/language.repo';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepo: LanguageRepo) {}
  async findAll() {
    const data = await this.languageRepo.findAll();
    return {
      data,
      totalItems: data.length,
    };
  }
  async findById(id: string) {
    const data = await this.languageRepo.findById(id);
    if (!data) throw NotFoundRecordException;
    return data;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateLanguageBodyType;
  }) {
    try {
      return await this.languageRepo.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw LanguageAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateById({
    id,
    updatedById,
    data,
  }: {
    id: string;
    updatedById: number;
    data: CreateLanguageBodyType;
  }) {
    try {
      const language = await this.languageRepo.updateById({
        id,
        updatedById,
        data,
      });
      return language;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.languageRepo.delete(id, true);
      return {
        message: 'Successfully deleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
