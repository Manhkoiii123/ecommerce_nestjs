import { Injectable } from '@nestjs/common';
import {
  CreateLanguageBodyDTO,
  UpdateLanguageBodyDTO,
} from 'src/routes/language/language.dto';
import { LanguageType } from 'src/routes/language/language.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class LanguageRepo {
  constructor(private readonly prisma: PrismaService) {}
  findAll(): Promise<LanguageType[]> {
    return this.prisma.language.findMany({
      where: {
        deletedAt: null,
      },
    });
  }
  findById(id: string): Promise<LanguageType | null> {
    return this.prisma.language.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }
  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateLanguageBodyDTO;
  }): Promise<LanguageType> {
    return this.prisma.language.create({
      data: {
        ...data,
        createdById,
      },
    });
  }
  updateById({
    id,
    updatedById,
    data,
  }: {
    id: string;
    updatedById: number;
    data: UpdateLanguageBodyDTO;
  }): Promise<LanguageType> {
    return this.prisma.language.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedById,
      },
    });
  }
  delete(id: string, isHard?: boolean): Promise<LanguageType> {
    return isHard
      ? this.prisma.language.delete({
          where: {
            id,
          },
        })
      : this.prisma.language.update({
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
