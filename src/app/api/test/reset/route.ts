// app/api/test/reset/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { generateMockData } from '@/data/mockData';

function isAllowed() {
  return process.env.PLAYWRIGHT === '1' || process.env.NODE_ENV === 'test';
}

export async function POST() {
  if (!isAllowed()) {
    return NextResponse.json({ success: false, error: 'Not allowed' }, { status: 403 });
  }

  try {
    const dataDir = process.env.TASKFLOW_DATA_DIR
      ? path.resolve(process.env.TASKFLOW_DATA_DIR)
      : path.join(process.cwd(), 'data');

    await fs.mkdir(dataDir, { recursive: true });

    const { projects, tasks } = generateMockData();

    await Promise.all([
      fs.writeFile(path.join(dataDir, 'projects.json'), JSON.stringify(projects, null, 2)),
      fs.writeFile(path.join(dataDir, 'tasks.json'), JSON.stringify(tasks, null, 2)),
    ]);

    return NextResponse.json({ success: true, seeded: { projects: projects.length, tasks: tasks.length } });
  } catch (error) {
    console.error('Test reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset test data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
