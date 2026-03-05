import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Create admin user if not exists
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@taskflow.com' },
      update: {},
      create: {
        email: 'admin@taskflow.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: adminPassword,
      },
    });

    // Create demo users if not exists
    const demoUsers = [
      { email: 'alice@taskflow.com', name: 'Alice' },
      { email: 'bob@taskflow.com', name: 'Bob' },
      { email: 'charlie@taskflow.com', name: 'Charlie' },
    ];

    for (const userData of demoUsers) {
      const password = await bcrypt.hash('password123', 10);
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          name: userData.name,
          role: 'USER',
          password,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Users seeded successfully',
      admin: admin.email,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
