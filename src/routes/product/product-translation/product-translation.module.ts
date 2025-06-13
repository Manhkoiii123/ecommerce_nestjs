import { Module } from '@nestjs/common';
import { ProductTranslationController } from 'src/routes/product/product-translation/product-translation.controller';
import { ProductTranslationRepository } from 'src/routes/product/product-translation/product-translation.repo';
import { ProductTranslationService } from 'src/routes/product/product-translation/product-translation.service';

@Module({
  controllers: [ProductTranslationController],
  providers: [ProductTranslationService, ProductTranslationRepository],
})
export class ProductTranslationModule {}
