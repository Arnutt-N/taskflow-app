import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: {},
    create: {
      email: 'admin@taskflow.com',
      name: 'Admin User',
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo users
  const demoUsers = [
    { email: 'alice@taskflow.com', name: 'Alice' },
    { email: 'bob@taskflow.com', name: 'Bob' },
    { email: 'charlie@taskflow.com', name: 'Charlie' },
  ];

  for (const userData of demoUsers) {
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: Role.USER,
        password,
      },
    });
    console.log('✅ User created:', user.email);
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
