import { Injectable } from '@nestjs/common';
import {
  CategoryTranslationType,
  CreateCategoryTranslationBodyType,
  GetCategoryTranslationDetailResType,
  UpdateCategoryTranslationBodyType,
} from 'src/routes/category/category-translation/category-translation.model';

import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CategoryTranslationRepo {
  constructor(private prismaService: PrismaService) {}
  findByid(id: number): Promise<GetCategoryTranslationDetailResType | null> {
    return this.prismaService.categoryTranslation.findUnique({
      where: { id, deletedAt: null },
    });
  }
  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.create({
      data: { ...data, createdById },
    });
  }
  update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateCategoryTranslationBodyType;
    updatedById: number;
  }): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  delete(id: number, isHard?: boolean): Promise<CategoryTranslationType> {
    return isHard
      ? this.prismaService.categoryTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.categoryTranslation.update({
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
