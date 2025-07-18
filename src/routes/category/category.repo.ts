import { Injectable } from '@nestjs/common';
import {
  CategoryIncludeTranslationType,
  CategoryType,
  CreateCategoryBodyType,
  GetAllCategoriesResType,
  UpdateCategoryBodyType,
} from 'src/routes/category/category.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll({
    parentCategoryId,
    languageId,
  }: {
    parentCategoryId?: number | null;
    languageId: string;
  }): Promise<GetAllCategoriesResType> {
    const categories = await this.prismaService.category.findMany({
      where: {
        parentCategoryId: parentCategoryId ?? null,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where:
            languageId === ALL_LANGUAGE_CODE
              ? { deletedAt: null }
              : { languageId, deletedAt: null },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data: categories, totalItems: categories.length };
  }

  async findById({
    id,
    languageId,
  }: {
    id: number;
    languageId: string;
  }): Promise<CategoryIncludeTranslationType | null> {
    return this.prismaService.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where:
            languageId === ALL_LANGUAGE_CODE
              ? { deletedAt: null }
              : { languageId, deletedAt: null },
        },
      },
    });
  }
  create({
    createdById,
    data,
  }: {
    createdById: number | null;
    data: CreateCategoryBodyType;
  }): Promise<CategoryIncludeTranslationType> {
    return this.prismaService.category.create({
      data: { ...data, createdById },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }
  update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateCategoryBodyType;
    updatedById: number;
  }): Promise<CategoryIncludeTranslationType> {
    return this.prismaService.category.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  delete(id: number, isHard?: boolean): Promise<CategoryType> {
    return isHard
      ? this.prismaService.category.delete({
          where: {
            id,
          },
        })
      : this.prismaService.category.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
  }
}
