// app/api/data/route.ts
import { NextResponse } from 'next/server';
import { getProjects, getTasks } from '@/lib/dataStore';

export async function GET() {
  try {
    const [projects, tasks] = await Promise.all([
      getProjects(),
      getTasks(),
    ]);

    return NextResponse.json({
      success: true,
      projects,
      tasks,
    });
  } catch (error) {
    console.error('Fetch data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
