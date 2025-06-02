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
