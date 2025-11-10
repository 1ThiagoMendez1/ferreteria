import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para obtener URLs de imágenes (removida ya que no se crean productos simulados)

async function main() {
  console.log('🌱 Starting database seed... (solo categorías y ubicaciones base)');

  // Create categories
  const categories = [
    { id: 'tools', name: 'Herramientas', icon: 'Wrench' },
    { id: 'plumbing', name: 'Plomería', icon: 'Droplets' },
    { id: 'electrical', name: 'Electricidad', icon: 'Zap' },
    { id: 'paint', name: 'Pintura', icon: 'PaintBucket' },
    { id: 'building-materials', name: 'Materiales de Construcción', icon: 'Construction' },
    { id: 'consultations', name: 'Asesorías', icon: 'Handshake' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  // Create locations
  const locations = [
    { id: 'aisle-1', name: 'Pasillo 1' },
    { id: 'aisle-3', name: 'Pasillo 3' },
    { id: 'aisle-5', name: 'Pasillo 5' },
    { id: 'aisle-7', name: 'Pasillo 7' },
    { id: 'paint-dept', name: 'Departamento de Pintura' },
    { id: 'outdoor-yard', name: 'Patio Exterior' },
    { id: 'warehouse-a', name: 'Almacén A' },
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: { id: location.id },
      update: {},
      create: location,
    });
  }

  // Nota: No se crean productos simulados para mantener la base de datos limpia
  // Los productos serán agregados manualmente a través del dashboard de administración
  console.log('📝 Base de datos preparada sin productos simulados');

  console.log('✅ Base de datos preparada con categorías y ubicaciones base (sin productos simulados)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });