#!/usr/bin/env tsx
/**
 * Migration Script: Legacy TiDB → Prisma Schema
 * 
 * Run: npx tsx scripts/migrate-data.ts
 */

import { PrismaClient, Role, ProjectStatus, TaskStatus, Priority } from '@prisma/client';
import mysql from 'mysql2/promise';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// Legacy database connection (same database, different tables)
async function getLegacyConnection() {
  const url = process.env.LEGACY_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  
  return mysql.createConnection(url);
}

// Status mappings
const projectStatusMap: Record<string, ProjectStatus> = {
  'Todo': ProjectStatus.TODO,
  'In Progress': ProjectStatus.IN_PROGRESS,
  'Review': ProjectStatus.REVIEW,
  'Done': ProjectStatus.DONE,
  'Cancelled': ProjectStatus.CANCELLED,
};

const taskStatusMap: Record<string, TaskStatus> = {
  'Todo': TaskStatus.TODO,
  'In Progress': TaskStatus.IN_PROGRESS,
  'Review': TaskStatus.REVIEW,
  'Done': TaskStatus.DONE,
  'Blocked': TaskStatus.BLOCKED,
};

const priorityMap: Record<string, Priority> = {
  'Low': Priority.LOW,
  'Medium': Priority.MEDIUM,
  'High': Priority.HIGH,
  'Critical': Priority.CRITICAL,
};

async function migrate() {
  console.log('🚀 Starting migration...\n');
  
  const legacy = await getLegacyConnection();
  
  try {
    // Check if legacy tables exist
    const [tables] = await legacy.execute(`
      SHOW TABLES LIKE 'projects'
    `) as any[];
    
    if (tables.length === 0) {
      console.log('⚠️  Legacy tables not found. Skipping migration.');
      return;
    }

    // 1. Get default admin user
    const admin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (!admin) {
      throw new Error('Admin user not found. Please run seed first.');
    }

    console.log('👤 Admin user:', admin.email);

    // 2. Migrate Projects
    console.log('\n📦 Migrating projects...');
    const [legacyProjects] = await legacy.execute('SELECT * FROM projects') as any[];
    
    let projectCount = 0;
    for (const p of legacyProjects) {
      const existing = await prisma.project.findUnique({
        where: { id: p.id },
      });

      if (!existing) {
        await prisma.project.create({
          data: {
            id: p.id,
            name: p.name,
            team: p.team,
            status: projectStatusMap[p.status] || ProjectStatus.TODO,
            deadline: p.deadline ? new Date(p.deadline) : null,
            progress: p.progress || 0,
            budget: p.budget || 0,
            revenue: p.revenue || 0,
            margin: p.margin || 0,
            description: p.description,
            createdAt: p.created_at ? new Date(p.created_at) : new Date(),
            updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
          },
        });
        projectCount++;
      }
    }
    console.log(`✅ Migrated ${projectCount} projects`);

    // 3. Migrate Tasks
    console.log('\n📝 Migrating tasks...');
    const [legacyTasks] = await legacy.execute('SELECT * FROM tasks') as any[];
    
    let taskCount = 0;
    let skippedTasks = 0;
    
    for (const t of legacyTasks) {
      // Check if task already exists
      const existing = await prisma.task.findUnique({
        where: { id: t.id },
      });

      if (existing) {
        skippedTasks++;
        continue;
      }

      // Check if project exists
      const projectExists = await prisma.project.findUnique({
        where: { id: t.project_id },
      });

      if (!projectExists) {
        console.log(`⚠️  Skipping task ${t.id}: Project ${t.project_id} not found`);
        skippedTasks++;
        continue;
      }

      await prisma.task.create({
        data: {
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          description: t.description,
          // Map assignee name to admin user (or null if not found)
          assigneeId: t.assignee ? admin.id : null,
          status: taskStatusMap[t.status] || TaskStatus.TODO,
          priority: priorityMap[t.priority] || Priority.MEDIUM,
          dueDate: t.due_date ? new Date(t.due_date) : null,
          estimatedHours: t.estimated_hours || 0,
          actualHours: t.actual_hours || 0,
          order: 0,
          createdAt: t.created_at ? new Date(t.created_at) : new Date(),
          updatedAt: t.updated_at ? new Date(t.updated_at) : new Date(),
        },
      });
      taskCount++;
    }
    console.log(`✅ Migrated ${taskCount} tasks`);
    if (skippedTasks > 0) {
      console.log(`⏭️  Skipped ${skippedTasks} tasks (already exist or missing project)`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Tasks: ${taskCount}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await legacy.end();
    await prisma.$disconnect();
  }
}

// Run migration
migrate()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
