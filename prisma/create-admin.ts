import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');

  // Create admin role if it doesn't exist
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  // Create seller role if it doesn't exist
  const sellerRole = await prisma.role.upsert({
    where: { name: 'seller' },
    update: {},
    create: { name: 'seller' },
  });

  // Create permissions
  const permissions = [
    { name: 'dashboard' },
    { name: 'products' },
    { name: 'orders' },
    { name: 'sales' },
    { name: 'consultations' },
    { name: 'warehouse' },
    { name: 'accounting' },
    { name: 'users' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('FranThiago25ferre', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tresetapas.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@tresetapas.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('Admin user created:', adminUser.email);
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });