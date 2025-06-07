import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/shared/services/prisma.service';
const prisma = new PrismaService();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  // all route
  const availableRoutes: [] = router.stack
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
  try {
    await prisma.permission.createMany({
      data: availableRoutes,
      skipDuplicates: true,
    });
  } catch (error) {
    console.log('🚀 ~ bootstrap ~ error:', error);
  }
  process.exit(0);
}
bootstrap();
