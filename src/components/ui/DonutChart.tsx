// components/ui/DonutChart.tsx
'use client';

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export const DonutChart = ({ data, size = 160 }: DonutChartProps) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativeAngle = 0;
  
  if (total === 0) return <div className="text-xs text-slate-400">No data</div>;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * 314} 314`; 
          const strokeDashoffset = -cumulativeAngle * 314;
          cumulativeAngle += percentage;
          
          return (
            <circle
              key={index}
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{total}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tasks</span>
      </div>
    </div>
  );
};
