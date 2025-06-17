import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HTTPMethod, RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
const prisma = new PrismaService();
const SellerModule = [
  'AUTH',
  'MANAGE-PRODUCT',
  'MEDIA',
  'PRODUCT-TRANSLATION',
  'PROFILE',
  'CART',
];
const ClientModule = ['AUTH', 'MEDIA', 'CART', 'PROFILE', 'ORDERS'];
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
    module: string;
  }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = layer.route?.stack[0].method.toUpperCase();
        const module = path.split('/')[1];
        return {
          path,
          method,
          name: method + ' ' + path,
          description: method + ' ' + path,
          module,
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

  // lấy permission trong db sau khi thêm
  const updatedPermissionsInDB = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  });
  //  admin role
  const adminRoleIds = updatedPermissionsInDB.map((item) => ({ id: item.id }));

  const sellerPermissionIds = updatedPermissionsInDB
    .filter((item) => {
      return SellerModule.includes(item.module.toUpperCase());
    })
    .map((item) => ({ id: item.id }));
  const clientPermissionIds = updatedPermissionsInDB
    .filter((item) => {
      return ClientModule.includes(item.module.toUpperCase());
    })
    .map((item) => ({ id: item.id }));

  await updateRole(adminRoleIds, RoleName.Admin);
  await updateRole(sellerPermissionIds, RoleName.Seller);
  await updateRole(clientPermissionIds, RoleName.Client);
  process.exit(0);
}
const updateRole = async (
  permissionsIds: { id: number }[],
  roleName: string,
) => {
  const role = await prisma.role.findFirstOrThrow({
    where: {
      name: roleName,
      deletedAt: null,
    },
  });
  await prisma.role.update({
    where: {
      id: role.id,
    },
    data: {
      permissions: {
        set: permissionsIds,
      },
    },
  });
};

bootstrap();
