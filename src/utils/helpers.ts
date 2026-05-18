import { Transaction, Category, CategoryStat, ChartData } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Format currency to IDR
export const formatCurrency = (amount: number, compact = false): string => {
  if (compact && amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (compact && amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date in Indonesian
export const formatDate = (dateStr: string, fmt = 'dd MMM yyyy'): string => {
  try {
    return format(parseISO(dateStr), fmt, { locale: idLocale });
  } catch {
    return dateStr;
  }
};

// Format relative time
export const formatRelativeDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return format(date, 'dd MMM yyyy', { locale: idLocale });
};

// Get greeting based on time
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return 'Selamat Malam';
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
};

// Get greeting emoji
export const getGreetingEmoji = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return '🌙';
  if (hour < 11) return '☀️';
  if (hour < 15) return '🌤️';
  if (hour < 19) return '🌅';
  return '🌙';
};

// Filter transactions by period
export const filterByPeriod = (
  transactions: Transaction[],
  period: 'all' | 'today' | 'week' | 'month' | 'year'
): Transaction[] => {
  const now = new Date();

  switch (period) {
    case 'today': {
      const todayStr = format(now, 'yyyy-MM-dd');
      return transactions.filter((t) => t.date === todayStr);
    }
    case 'week': {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      return transactions.filter((t) =>
        isWithinInterval(parseISO(t.date), { start, end })
      );
    }
    case 'month': {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return transactions.filter((t) =>
        isWithinInterval(parseISO(t.date), { start, end })
      );
    }
    case 'year': {
      const start = startOfYear(now);
      const end = endOfYear(now);
      return transactions.filter((t) =>
        isWithinInterval(parseISO(t.date), { start, end })
      );
    }
    default:
      return transactions;
  }
};

// Calculate totals
export const calculateTotals = (transactions: Transaction[]) => {
  let income = 0;
  let expense = 0;
  transactions.forEach((t) => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });
  return { income, expense, balance: income - expense };
};

// Get current month transactions
export const getCurrentMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start, end })
  );
};

// Get previous month transactions
export const getPreviousMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const prevMonth = subMonths(now, 1);
  const start = startOfMonth(prevMonth);
  const end = endOfMonth(prevMonth);
  return transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start, end })
  );
};

// Get category stats
export const getCategoryStats = (
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense' = 'expense'
): CategoryStat[] => {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const grouped: Record<string, { total: number; count: number }> = {};
  filtered.forEach((t) => {
    if (!grouped[t.categoryId]) grouped[t.categoryId] = { total: 0, count: 0 };
    grouped[t.categoryId].total += t.amount;
    grouped[t.categoryId].count += 1;
  });

  return Object.entries(grouped)
    .map(([catId, data]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        categoryId: catId,
        name: cat?.name || 'Lainnya',
        color: cat?.color || '#6b7280',
        icon: cat?.icon || '📦',
        total: data.total,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
        count: data.count,
      };
    })
    .sort((a, b) => b.total - a.total);
};

// Get weekly chart data (last 7 days)
export const getWeeklyChartData = (transactions: Transaction[]): ChartData[] => {
  const days: ChartData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEE', { locale: idLocale });

    const dayTxs = transactions.filter((t) => t.date === dateStr);
    const income = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    days.push({ name: dayName, income, expense });
  }
  return days;
};

// Get monthly chart data (last 6 months)
export const getMonthlyChartData = (transactions: Transaction[]): ChartData[] => {
  const months: ChartData[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthName = format(date, 'MMM', { locale: idLocale });

    const monthTxs = transactions.filter((t) =>
      isWithinInterval(parseISO(t.date), { start, end })
    );
    const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    months.push({ name: monthName, income, expense });
  }
  return months;
};

// Budget usage calculation
export const getBudgetUsage = (
  budgets: { categoryId: string; amount: number }[],
  transactions: Transaction[],
  month: string
): { categoryId: string; amount: number; spent: number; percentage: number }[] => {
  const monthTxs = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(month)
  );

  return budgets.map((b) => {
    const spent = monthTxs
      .filter((t) => t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      categoryId: b.categoryId,
      amount: b.amount,
      spent,
      percentage: b.amount > 0 ? (spent / b.amount) * 100 : 0,
    };
  });
};

// Percentage change
export const percentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Color utilities
export const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tunai', icon: '💵' },
  { value: 'debit', label: 'Kartu Debit', icon: '💳' },
  { value: 'credit', label: 'Kartu Kredit', icon: '💳' },
  { value: 'transfer', label: 'Transfer', icon: '🏦' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱' },
  { value: 'other', label: 'Lainnya', icon: '💰' },
];

export const CATEGORY_ICONS = [
  '🍽️', '☕', '🚗', '🛍️', '📄', '📚', '🏥', '🎮', '📦',
  '💼', '💻', '📈', '🏦', '💰', '🎵', '✈️', '🏠', '👗',
  '🎁', '🐾', '⚽', '🎨', '🔧', '📱', '🌿', '🍕', '🏖️',
  '💊', '🎓', '🚀', '🌟', '💎', '🛡️', '🎯', '🌈',
];

export const CATEGORY_COLORS = [
  '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e11d48', '#d97706', '#7c3aed', '#0284c7',
  '#65a30d', '#dc2626', '#9333ea', '#0891b2', '#ca8a04',
];
