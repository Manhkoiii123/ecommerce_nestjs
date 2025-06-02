# seed data

```ts
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();

// const main = async () => {};
```

khi dugnf thế này => chạy `npx ts-node src/seed/seed.ts` => báo lỗi ko thấy `PrismaService` do ko hiểu

cài `npm i tsconfig-paths -D`

sau đó sửa cái `tsconfig.json`

```ts
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  },
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  }
}

```

khi đó mới chạy được

# Cache clientRoleId khi đăng ký user

để mỗi lần register => ko phải query lại cái roleId nữa

# Hạn chế try-catch với CatchEverythingFilter

muốn throw ra 1 lỗi chi tiết => try catch

lỗi chung chung => ko cần (lỗi 500)

code file `src\shared\filters\catch-everything.filter.ts`

docs : `https://docs.nestjs.com/exception-filters#catch-everything`

=> ko càn try catch bên controller nữa (nhưng vẫn nên dùng try catch)
