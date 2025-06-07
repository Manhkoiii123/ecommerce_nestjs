import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HTTPMethod } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
const prisma = new PrismaService();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;
  const permissionIndb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  });

  // all route
  const availableRoutes: {
    path: string;
    method: keyof typeof HTTPMethod;
    name: string;
    description: string;
  }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = layer.route?.stack[0].method.toUpperCase();
        return {
          path,
          method,
          name: method + ' ' + path,
          description: method + ' ' + path,
        };
      }
    })
    .filter((item) => item !== undefined);
  // console.log(availableRoutes);

  //tạo object permissionInDBMap với key là [method-path]
  const permissionInDBMap = permissionIndb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item;
    return acc;
  }, {});
  // tạo objet availableRoutesMap với key là [method-path]
  const availableRoutesMap = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item;
    return acc;
  }, {});
  // tìm permission trong db mà ko tồn tại trong availableRoutes
  const permissionToDelete = permissionIndb.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`];
  });
  // delete
  if (permissionToDelete.length > 0) {
    await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionToDelete.map((item) => item.id),
        },
      },
    });
  }
  // tìm route không tồn tại trong db mà tồn tại trong availableRoutes
  const routersToAdd = availableRoutes.filter((item) => {
    return !permissionInDBMap[`${item.method}-${item.path}`];
  });
  // thêm các routes dưới dạng permissions databse
  if (routersToAdd.length > 0) {
    await prisma.permission.createMany({
      data: routersToAdd,
      skipDuplicates: true,
    });
  } else {
    console.log('No permission to add');
  }
  await prisma.permission.createMany({
    data: availableRoutes,
    skipDuplicates: true,
  });

  process.exit(0);
}
bootstrap();
