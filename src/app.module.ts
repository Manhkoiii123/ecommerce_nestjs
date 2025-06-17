import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import CustomZodValidationPipe from 'src/shared/pipe/custom-zod-validation.pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import { LanguageModule } from './routes/language/language.module';
import { PermissionModule } from './routes/permission/permission.module';
import { RoleModule } from './routes/role/role.module';
import { ProfileModule } from 'src/routes/profile/profile.module';
import { UserModule } from 'src/routes/user/user.module';
import { MediaModule } from 'src/routes/media/media.module';
import { BrandModule } from 'src/routes/brand/brand.module';
import { BrandTranslationModule } from 'src/routes/brand/brand-translation/brand-translation.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { CategoryModule } from 'src/routes/category/category.module';
import { CategoryTranslationModule } from 'src/routes/category/category-translation/category-translation.module';
import { ProductModule } from 'src/routes/product/product.module';
import { ProductTranslationModule } from 'src/routes/product/product-translation/product-translation.module';
import { CartModule } from 'src/routes/cart/cart.module';
import { OrderModule } from 'src/routes/order/order.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    ProductModule,
    ProductTranslationModule,
    CartModule,
    OrderModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // query param là lang
        AcceptLanguageResolver, // đại diện cho Accept-language ở header khi truyền lên
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: CatchEverythingFilter,
    // },
  ],
})
export class AppModule {}
