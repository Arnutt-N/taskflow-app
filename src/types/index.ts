// types/index.ts

export interface Project {
  id: string;
  name: string;
  team: string;
  status: 'In Progress' | 'Planning' | 'Completed' | 'Todo';
  deadline: string;
  progress: number;
  budget: number;
  revenue: number;
  profit?: number;
  margin?: number;
  calculatedProgress?: number;
  taskCount?: number;
  doneTasks?: number;
  members?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: 'Done' | 'In Progress' | 'Todo' | 'Planning' | 'Review' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  dueDate?: string;
  createdAt?: string;
}

export interface DashboardData {
  projects: Project[];
  tasks: Task[];
}

export interface Stats {
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  tasks: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
  };
}

export type TabType = 'dashboard' | 'projects' | 'tasks';

export interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

export interface BarChartItem {
  label: string;
  v1: number;
  v2: number;
}
