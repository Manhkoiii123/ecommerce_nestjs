/* eslint-disable @typescript-eslint/no-namespace */
import { ProductTranslationType } from 'src/routes/product/product-translation/product-translation.model';
import { VariantsType } from 'src/routes/product/product.model';

declare global {
  namespace PrismaJson {
    type Variants = VariantsType;
    type ProductTranslations = Pick<
      ProductTranslationType,
      'id' | 'name' | 'description' | 'languageId'
    >[];
    type Receiver = {
      name: string;
      phone: string;
      address: string;
    };
  }
}

export {};
