import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando productos de muestra...');

  // Get existing categories and locations
  const categories = await prisma.category.findMany();
  const locations = await prisma.location.findMany();

  console.log('📊 Categorías encontradas:', categories.length);
  console.log('📍 Ubicaciones encontradas:', locations.length);

  if (categories.length === 0 || locations.length === 0) {
    console.log('❌ No hay categorías o ubicaciones. Ejecuta primero: npm run db:seed');
    console.log('Categorías:', categories.map(c => `${c.id}: ${c.name}`));
    console.log('Ubicaciones:', locations.map(l => `${l.id}: ${l.name}`));
    return;
  }

  const sampleProducts = [
    {
      name: 'Martillo de Garra 16oz',
      description: 'Martillo profesional con cabeza de acero forjado y mango ergonómico de fibra de vidrio',
      price: 45000,
      quantity: 25,
      minStock: 5,
      categoryId: categories[0].id,
      locationId: locations[0].id,
      imageUrl: 'https://images.pexels.com/photos/162553/keys-carpenter-tools-workshop-162553.jpeg',
      imageHint: 'hammer'
    },
    {
      name: 'Destornillador Phillips #2',
      description: 'Destornillador profesional con punta magnetizada y mango antideslizante',
      price: 12000,
      quantity: 50,
      minStock: 10,
      categoryId: categories[0].id,
      locationId: locations[0].id,
      imageUrl: 'https://images.pexels.com/photos/162557/screwdriver-flathead-tools-162557.jpeg',
      imageHint: 'screwdriver'
    },
    {
      name: 'Taladro Inalámbrico 18V',
      description: 'Taladro percutor con batería de litio, incluye 2 baterías y cargador rápido',
      price: 285000,
      quantity: 8,
      minStock: 2,
      categoryId: categories[0].id,
      locationId: locations[0].id,
      imageUrl: 'https://images.pexels.com/photos/162553/keys-carpenter-tools-workshop-162553.jpeg',
      imageHint: 'drill'
    }
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('✅ Productos de muestra agregados exitosamente');
  console.log(`📊 Total de productos agregados: ${sampleProducts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });