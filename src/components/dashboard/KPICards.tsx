// components/dashboard/KPICards.tsx
'use client';

import { TrendingUp, PieChart, Wallet } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Stats } from '@/types';

interface KPICardsProps {
  stats: Stats;
}

export const KPICards = ({ stats }: KPICardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard 
      label="Total Revenue" 
      value={formatCurrency(stats.totalRevenue)} 
      subtext="รายได้จากโปรเจกต์ใน scope ปัจจุบัน"
      icon={TrendingUp}
    />
    <StatCard 
      label="Total Cost" 
      value={formatCurrency(stats.totalCost)} 
      subtext="ต้นทุนและค่าใช้จ่าย"
      icon={PieChart}
    />
    <StatCard 
      label="Net Profit" 
      value={formatCurrency(stats.totalProfit)} 
      subtext="อัตรากำไรสุทธิ (ประมาณการ)"
      trend={stats.totalRevenue ? Math.round((stats.totalProfit / stats.totalRevenue) * 100) : 0}
      icon={Wallet}
      active
    />
  </div>
);
