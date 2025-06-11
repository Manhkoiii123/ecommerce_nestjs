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

# Áp dụng Repository Pattern

1 Repository bao gồm

1. **Entity(model)** : đại diện cho bảng trong db

2. **Repository** : đại diện cho các phương thức truy vấn
3. **Service layer** : gọi Repository để thực hiện các thao tác với db mà ko phụ thuộc vào ORM cụ thể

thường thì sẽ chia dựa như trên

## refactor DTO

thấy đang khai báo lại email, password ở nhiều chỗ => ko hay

=> tạo file `model` của `auth` => dùng file này để validation

## refactor service

=> file `auth.repo.ts` => refactor file này

# Phân tích flow OTP Code và khai báo end point

# global guard

nhiều route là public => ko dùng decorator => public

dùng decorator => dùng guard

nếu nhiều route là private thì ngược lại

dùng decorator isPublic => mới public

ko dùng => mặc định dùng bearerToken

# Chức năng quên mật khẩu

# 2FA - Two Factor Authentication

## Tạo mã 2FA

### @POST(`/2fa/setup`)

- Backend sẽ trả về 1 mã Key URI để FE tạo QR Code, bonus thêm secret key
- Một khi đã tạo mã 2FA thì lúc login, bạn phải nhập mã 2FA để xác thực (hoặc OTP Code phòng trường hợp mất điện thoại)

## Vô hiệu hóa 2FA

### @POST(`/2fa/disable`)

- Xóa `totpSecret` của user trong DB

## Xác thực 2FA hoặc OTP Code

- Xảy ra ở API Login và API vô hiệu hóa 2FA

Với Flow này, chúng ta sẽ đảm bảo việc có 1 giải pháp backup trong trường hợp người dùng đánh mất điện thoại hoặc không thể truy cập vào mã 2FA

# Chuyển đổi prisma db push sang prisma migrate

## 1. Đồng bộ `Schema.prisma` với DB

nếu ch có file `schema.prisma` => tạo 1 file cơ bản kết nỗi db hiện tại và chạy câu lệnh sau để đọc db và cập nhật file `schema.prisma`

```bash
npx prisma db pull
```

đã có sẵn rồi do đang dùng cách `npx prisma db push`

thì chạy lại câu lệnh `npx prisma db push` 1 lần nữa để chắc chắn đồng bộ với db hiện tại

## 2. tạo baseline migration

1. tạo thư mục `prisma/migrations/0_init`
2. dựa vào file `schema.prisma` để tạo file migration bằng câu lệnh

```bash
npx prisma migrate diff \
--from-empty \
--to-schema-datamodel prisma/schema.prisma \
--script > prisma/migrations/0_init/migration.sql
```

3. đánh dấu file `0_init/migration.sql` là đã được áp dụng. câu lệnh dưới đây ko thay đổi cấu trúc db, nó chỉ update data trong `_prisma_migrations`

```bash
npx prisma migrate resolve --applied 0_init
```

4. từ đó có thể chuyển từ `npx prisma db push` sang `npx prisma migrate `.
   commit lại file `schema.prisma` và đưa lên git

# Thêm chức năng Partial Unique Index bằng prisma migrate

`@@unique([path, method],{where:{deletedAt:null}})` khi deletedAt là null thì mới được phép unique => ko hỗ trợ partial unique

## 3. Thêm một tính năng mà Prisma Schema không hỗ trợ

Để làm thì schema của các bạn phải sync với database hiện tại và dự án phải sử dụng `prisma migrate` thay vì `prisma db push`

Ví dụ mình muốn thêm Partial Unique Indexes vào một table trên PostgreSQL. Prisma Schema không hỗ trợ tính năng này, nhưng chúng ta có thể thêm bằng cách sửa file migration.

1. Tạo một file migration `npx prisma migrate dev --create-only`. Câu lệnh này yêu cầu Prisma kiểm tra file `schema.prisma` với trạng thái database để tạo ra file migration mới. `--create-only` Tùy chọn này giới hạn hành động của lệnh chỉ ở bước tạo file migration, mà không thực hiện bước áp dụng (apply) migration vào cơ sở dữ liệu. Ở bước này thì nó sẽ tạo ra file sql rỗng

2. Paste nội dung sau vào file migration mới tạo

   ```sql
   CREATE UNIQUE INDEX permission_path_method_unique
   ON "Permission" (path, method)
   WHERE "deletedAt" IS NULL;
   ```

3. Áp dụng migration bằng cách chạy lệnh `npx prisma migrate dev`

# down migration

=> back lại `prisma.schema` => `npx prisma migrate dev --create-only` => `prisma migrate dev`

## 🔄 Flow middleware

### Mỗi request đi qua, mình sẽ:

1. Kiểm tra xem AT có hợp lệ không, còn hạn hay không. Từ đó lấy ra `userId` và `roleId`
2. Dựa `roleId` vào để query database lấy danh sách permission của role đó
3. Kiểm tra danh sách permission của role đó có quyền truy cập endpoint đó không

### Mình có thể thêm sau bước 2 là: Dựa vào `deviceId` query `Device` để kiểm tra xem thiết bị đó có `isActive=true` không từ đó quyết định cho phép hoặc không cho phép request đi qua. Lúc này chúng ta có thể làm được chức năng đăng xuất thiết bị ngay lập tức. Nhưng điểm dở là phải tốn 1 query (hoặc thêm 1 vài lần join table), điều này làm tăng latency và tăng gánh nặng lên database, nhất là khi có nhiều người request.

# upload ảnh lên s3

bật permission cho nó => tra gg `setting permission for website access s3`

`https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html`

sửa cái permission và cái policy theo cái docs
