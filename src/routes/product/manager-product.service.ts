import { ForbiddenException, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {
  CreateProductBodyType,
  GetManagerProductsQueryType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import { ProductRepository } from 'src/routes/product/product.repo';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class ManageProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  // check là ng tạo sản phẩm thì cho xem, admin thì cho xem
  validatePrivilege({
    userIdRequest,
    createdById,
    roleName,
  }: {
    userIdRequest: number;
    createdById: number | null | undefined;
    roleName: string;
  }) {
    if (userIdRequest !== createdById && roleName !== RoleName.Admin)
      throw new ForbiddenException('Forbidden');
    return true;
  }
  // danh sach sản phẩm của 1 shop
  async list(props: {
    query: GetManagerProductsQueryType;
    userIdRequest: number;
    roleName: string;
  }) {
    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      createdById: props.query.createdById,
      roleName: props.roleName,
    });
    const data = await this.productRepo.list({
      page: props.query.page,
      limit: props.query.limit,
      languageId: I18nContext.current()?.lang as string,
      createdbyId: props.query.createdById,
      isPublic: props.query.isPublic,
      name: props.query.name,
      brandIds: props.query.brandIds,
      categories: props.query.categories,
      minPrice: props.query.minPrice,
      maxPrice: props.query.maxPrice,
      orderBy: props.query.orderBy,
      sortBy: props.query.sortBy,
    });
    return data;
  }
  async findById(props: {
    productId: number;
    userIdRequest: number;
    roleName: string;
  }) {
    const product = await this.productRepo.getDetail({
      productId: props.productId,
      languageId: I18nContext.current()?.lang as string,
    });

    if (!product) throw NotFoundRecordException;

    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      createdById: product.createdById,
      roleName: props.roleName,
    });
    return product;
  }
  create({
    data,
    createdById,
  }: {
    createdById: number;
    data: CreateProductBodyType;
  }) {
    return this.productRepo.create({ data, createdById });
  }
  async update({
    productId,
    updatedById,
    data,
    roleName,
  }: {
    productId: number;
    updatedById: number;
    data: UpdateProductBodyType;
    roleName: string;
  }) {
    const product = await this.productRepo.findById({ productId });
    if (!product) throw NotFoundRecordException;
    this.validatePrivilege({
      userIdRequest: updatedById,
      createdById: product.createdById,
      roleName: roleName,
    });
    try {
      const p = this.productRepo.update({ id: productId, updatedById, data });
      return p;
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
  async delete(productId: number, roleName: string, deletedById: number) {
    const product = await this.productRepo.findById({ productId });
    if (!product) throw NotFoundRecordException;
    this.validatePrivilege({
      userIdRequest: deletedById,
      createdById: product.createdById,
      roleName: roleName,
    });
    try {
      await this.productRepo.delete(productId);
      return {
        message: 'Success.BrandDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
