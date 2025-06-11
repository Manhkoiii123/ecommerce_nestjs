// import { PrismaService } from 'src/shared/services/prisma.service';

// const prisma = new PrismaService();
// const addBrands = async () => {
//   const brands = Array(10000)
//     .fill(0)
//     .map((_, index) => ({
//       logo: `logo${index}`,
//     }));

//   try {
//     const cnt = await prisma.brand.createMany({ data: brands });
//     console.log('🚀 ~ addBrands ~ cnt:', cnt);
//   } catch (error) {
//     console.log('🚀 ~ addBrands ~ error:', error);
//   }
// };

// addBrands();
