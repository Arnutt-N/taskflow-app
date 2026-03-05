// data/mockData.ts
import { DashboardData } from '@/types';

export const generateMockData = (): DashboardData => {
  const projects = [
    { 
      id: 'p1', 
      name: 'ติดตั้ง Solar Rooftop โรงงาน A (500kW)', 
      team: 'Engineering', 
      status: 'In Progress' as const, 
      deadline: '2024-06-30', 
      progress: 65, 
      budget: 12500000, 
      revenue: 16500000 
    },
    { 
      id: 'p2', 
      name: 'สถานีชาร์จ EV ห้างสรรพสินค้า Grand Plaza', 
      team: 'Installation', 
      status: 'Planning' as const, 
      deadline: '2024-08-15', 
      progress: 15, 
      budget: 850000, 
      revenue: 1200000 
    },
    { 
      id: 'p3', 
      name: 'ซ่อมบำรุงโซล่าฟาร์ม (Solar Farm Maintenance)', 
      team: 'Maintenance', 
      status: 'Completed' as const, 
      deadline: '2024-02-01', 
      progress: 100, 
      budget: 150000, 
      revenue: 350000 
    },
    { 
      id: 'p4', 
      name: 'ระบบกักเก็บพลังงาน (ESS) อาคารสำนักงานใหญ่', 
      team: 'R&D', 
      status: 'In Progress' as const, 
      deadline: '2024-12-20', 
      progress: 45, 
      budget: 4500000, 
      revenue: 6000000 
    },
    { 
      id: 'p5', 
      name: 'สำรวจพื้นที่ติดตั้ง Solar Cell หมู่บ้านจัดสรร', 
      team: 'Sales & Survey', 
      status: 'Todo' as const, 
      deadline: '2024-03-20', 
      progress: 0, 
      budget: 50000, 
      revenue: 0 
    },
  ];

  const tasks = Array.from({ length: 45 }).map((_, i) => {
    const statuses = ['Done', 'In Progress', 'Todo', 'Planning'] as const;
    const priorities = ['High', 'Medium', 'Low', 'Critical'] as const;
    const assignees = ['Wichai', 'Somsri', 'Ken', 'Alice', 'Charlie'];
    const projectIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
    
    return {
      id: `t${i + 1}`,
      projectId: projectIds[i % 5],
      title: `Task operation update #${i + 1} for system check`,
      assignee: assignees[i % 5],
      status: statuses[i % 4],
      priority: priorities[i % 4]
    };
  });

  return { projects, tasks };
};
