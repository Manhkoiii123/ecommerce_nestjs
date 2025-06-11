import { Injectable } from '@nestjs/common';
import {
  BrandTranslationType,
  CreateBrandTranslationBodyType,
  GetBrandTranslationDetailResType,
  UpdateBrandTranslationBodyType,
} from 'src/routes/brand/brand-translation/brand-translation.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class BrandTranslationRepo {
  constructor(private prismaService: PrismaService) {}
  findByid(id: number): Promise<GetBrandTranslationDetailResType | null> {
    return this.prismaService.brandTranslation.findUnique({
      where: { id, deletedAt: null },
    });
  }
  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandTranslationBodyType;
  }): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.create({
      data: { ...data, createdById },
    });
  }
  update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateBrandTranslationBodyType;
    updatedById: number;
  }): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.update({
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

  delete(id: number, isHard?: boolean): Promise<BrandTranslationType> {
    return isHard
      ? this.prismaService.brandTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brandTranslation.update({
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
