import { Module } from '@nestjs/common';
import { ManageProductController } from 'src/routes/product/manager-product.controller';
import { ManageProductService } from 'src/routes/product/manager-product.service';
import { ProductController } from 'src/routes/product/product.controller';
import { ProductRepository } from 'src/routes/product/product.repo';
import { ProductService } from 'src/routes/product/product.service';

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepository, ManageProductService],
})
export class ProductModule {}
