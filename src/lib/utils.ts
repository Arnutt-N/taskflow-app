// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merger (React 19 friendly)
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatNumber = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '0';
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
};

export const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)} ฿`;
};

export const getTodayLabel = (): string => {
  return new Date().toLocaleDateString('th-TH', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};
