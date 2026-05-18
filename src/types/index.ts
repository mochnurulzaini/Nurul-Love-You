export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes: string;
  paymentMethod: 'cash' | 'debit' | 'credit' | 'transfer' | 'ewallet' | 'other';
  color?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
  spent?: number;
}

export interface SavingsGoalHistory {
  date: string;
  amount: number;
  running: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  color: string;
  icon: string;
  createdAt: string;
  history: SavingsGoalHistory[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  accentColor: string;
  pinEnabled: boolean;
  pin: string;
  dailyQuoteEnabled: boolean;
  notificationsEnabled: boolean;
}

export type PaymentMethod = Transaction['paymentMethod'];

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
  count: number;
}
