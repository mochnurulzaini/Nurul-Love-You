import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category, Budget, SavingsGoal, AppSettings } from '../types';
import { defaultCategories } from '../data/defaultData';
import { generateId } from '../utils/helpers';

interface AppState {
  // Data
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: AppSettings;

  // UI State
  sidebarOpen: boolean;
  activeTab: string;
  searchQuery: string;
  filterCategory: string;
  filterType: 'all' | 'income' | 'expense';
  filterPeriod: 'all' | 'today' | 'week' | 'month' | 'year';

  // Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => void;

  // Actions - Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Actions - Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Actions - Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addToSavingsGoal: (id: string, amount: number) => void;

  // Actions - Settings
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (q: string) => void;
  setFilterCategory: (cat: string) => void;
  setFilterType: (type: 'all' | 'income' | 'expense') => void;
  setFilterPeriod: (period: 'all' | 'today' | 'week' | 'month' | 'year') => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAllData: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  currency: 'IDR',
  language: 'id',
  accentColor: 'emerald',
  pinEnabled: false,
  pin: '',
  dailyQuoteEnabled: true,
  notificationsEnabled: true,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,
      budgets: [],
      savingsGoals: [],
      settings: defaultSettings,

      sidebarOpen: true,
      activeTab: 'dashboard',
      searchQuery: '',
      filterCategory: 'all',
      filterType: 'all',
      filterPeriod: 'month',

      // Transactions
      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },

      updateTransaction: (id, tx) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...tx } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      duplicateTransaction: (id) => {
        const state = get();
        const tx = state.transactions.find((t) => t.id === id);
        if (!tx) return;
        const newTx: Transaction = {
          ...tx,
          id: generateId(),
          createdAt: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          notes: tx.notes ? `${tx.notes} (copy)` : '(copy)',
        };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },

      // Categories
      addCategory: (cat) => {
        const newCat: Category = { ...cat, id: generateId() };
        set((state) => ({ categories: [...state.categories, newCat] }));
      },

      updateCategory: (id, cat) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...cat } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      // Budgets
      addBudget: (budget) => {
        const newBudget: Budget = { ...budget, id: generateId() };
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      },

      updateBudget: (id, budget) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },

      // Savings Goals
      addSavingsGoal: (goal) => {
        const newGoal: SavingsGoal = {
          ...goal,
          id: generateId(),
          createdAt: new Date().toISOString(),
          history: [],
        };
        set((state) => ({ savingsGoals: [...state.savingsGoals, newGoal] }));
      },

      updateSavingsGoal: (id, goal) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...goal } : g
          ),
        }));
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        }));
      },

      addToSavingsGoal: (id, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => {
            if (g.id !== id) return g;
            const newCurrent = g.currentAmount + amount;
            return {
              ...g,
              currentAmount: newCurrent,
              history: [
                ...(g.history || []),
                { date: new Date().toISOString(), amount, running: newCurrent },
              ],
            };
          }),
        }));
      },

      // Settings
      updateSettings: (settings) => {
        set((state) => ({ settings: { ...state.settings, ...settings } }));
      },

      // UI
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterCategory: (cat) => set({ filterCategory: cat }),
      setFilterType: (type) => set({ filterType: type }),
      setFilterPeriod: (period) => set({ filterPeriod: period }),

      // Data management
      exportData: () => {
        const state = get();
        return JSON.stringify({
          transactions: state.transactions,
          categories: state.categories,
          budgets: state.budgets,
          savingsGoals: state.savingsGoals,
          settings: state.settings,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        });
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            transactions: data.transactions || [],
            categories: data.categories || defaultCategories,
            budgets: data.budgets || [],
            savingsGoals: data.savingsGoals || [],
            settings: { ...defaultSettings, ...(data.settings || {}) },
          });
          return true;
        } catch {
          return false;
        }
      },

      resetAllData: () => {
        set({
          transactions: [],
          categories: defaultCategories,
          budgets: [],
          savingsGoals: [],
          settings: defaultSettings,
        });
      },
    }),
    {
      name: 'moneyflow-storage',
      version: 1,
    }
  )
);
