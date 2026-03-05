import { describe, it, expect } from 'vitest';

import { formatNumber, formatCurrency, getTodayLabel } from '@/lib/utils';

// Note: TaskFlow utils are Thai-locale oriented (th-TH) and append " ฿".

const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};


describe('Utility Functions', () => {
  describe('formatNumber', () => {
    it('should format positive numbers (Thai locale, no decimals)', () => {
      // th-TH may use comma separators similar to en-US for these values
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should format negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should format undefined/null as 0', () => {
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber(null)).toBe('0');
    });

    it('should drop decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,235');
    });
  });

  describe('formatCurrency', () => {
    it('should format THB with ฿ suffix', () => {
      expect(formatCurrency(1000)).toBe('1,000 ฿');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1000)).toBe('-1,000 ฿');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(25, 100)).toBe(25);
      expect(calculateProgress(75, 100)).toBe(75);
    });

    it('should handle zero total', () => {
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(50, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateProgress(1, 3)).toBe(33);
      expect(calculateProgress(2, 3)).toBe(67);
    });

    it('should handle completed > total', () => {
      expect(calculateProgress(150, 100)).toBe(150);
    });
  });

  describe('getTodayLabel', () => {
    it('should return a non-empty Thai-formatted date label', () => {
      const label = getTodayLabel();
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
