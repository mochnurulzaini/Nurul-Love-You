import { Category, Transaction, Budget, SavingsGoal } from '../types';

export const defaultCategories: Category[] = [
  // Expense categories
  { id: 'cat-food', name: 'Makanan', icon: '🍽️', color: '#f59e0b', type: 'expense', isDefault: true },
  { id: 'cat-drink', name: 'Minuman', icon: '☕', color: '#8b5cf6', type: 'expense', isDefault: true },
  { id: 'cat-transport', name: 'Transportasi', icon: '🚗', color: '#3b82f6', type: 'expense', isDefault: true },
  { id: 'cat-shopping', name: 'Belanja', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
  { id: 'cat-bills', name: 'Tagihan', icon: '📄', color: '#ef4444', type: 'expense', isDefault: true },
  { id: 'cat-education', name: 'Pendidikan', icon: '📚', color: '#0ea5e9', type: 'expense', isDefault: true },
  { id: 'cat-health', name: 'Kesehatan', icon: '🏥', color: '#10b981', type: 'expense', isDefault: true },
  { id: 'cat-entertainment', name: 'Hiburan', icon: '🎮', color: '#6366f1', type: 'expense', isDefault: true },
  { id: 'cat-other-exp', name: 'Lainnya', icon: '📦', color: '#6b7280', type: 'expense', isDefault: true },

  // Income categories
  { id: 'cat-salary', name: 'Gaji', icon: '💼', color: '#10b981', type: 'income', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', icon: '💻', color: '#06b6d4', type: 'income', isDefault: true },
  { id: 'cat-investment', name: 'Investasi', icon: '📈', color: '#f59e0b', type: 'income', isDefault: true },
  { id: 'cat-savings', name: 'Tabungan', icon: '🏦', color: '#8b5cf6', type: 'income', isDefault: true },
  { id: 'cat-other-inc', name: 'Lainnya', icon: '💰', color: '#84cc16', type: 'income', isDefault: true },
];

export const dailyQuotes = [
  { quote: "Hemat pangkal kaya, investasi pangkal sejahtera.", author: "Pepatah Indonesia" },
  { quote: "Uang adalah alat, bukan tujuan. Gunakan dengan bijak.", author: "MoneyFlow" },
  { quote: "Sedikit demi sedikit lama-lama menjadi bukit.", author: "Pepatah" },
  { quote: "Catat setiap pengeluaran kecil, karena dari sana kekayaan dimulai.", author: "Robert Kiyosaki" },
  { quote: "Jangan tunggu kaya untuk mulai menabung. Mulai menabung untuk menjadi kaya.", author: "MoneyFlow" },
  { quote: "Budget bukan pembatas kebebasan, tapi peta menuju kebebasan finansial.", author: "Dave Ramsey" },
  { quote: "Investasikan pada dirimu sendiri. Itulah investasi terbaik yang bisa kamu lakukan.", author: "Warren Buffett" },
  { quote: "Hargai setiap rupiah yang masuk dan rencanakan setiap rupiah yang keluar.", author: "MoneyFlow" },
  { quote: "Kesejahteraan finansial dimulai dari kebiasaan mencatat, bukan dari jumlah gaji.", author: "MoneyFlow" },
  { quote: "Bukan seberapa besar penghasilan, tapi seberapa bijak kamu mengelolanya.", author: "T. Harv Eker" },
];

export const financialInsights = [
  "💡 Pengeluaran makanan bulan ini lebih tinggi dari rata-rata",
  "📈 Pemasukan bulan ini meningkat dibanding bulan lalu",
  "⚠️ Budget transportasi hampir mencapai batas",
  "🎯 Kamu sudah menghemat lebih banyak dari bulan lalu",
  "💰 Coba alokasikan 20% penghasilan untuk tabungan",
];

// Generate sample demo transactions for first-time users
export const generateDemoData = (): { transactions: Transaction[]; budgets: Budget[]; savingsGoals: SavingsGoal[] } => {
  const today = new Date();
  const transactions: Transaction[] = [];

  // Generate 2 months of sample data
  for (let i = 0; i < 45; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Income (every 30 days)
    if (i === 0 || i === 30) {
      transactions.push({
        id: `demo-inc-${i}`,
        type: 'income',
        amount: 8500000,
        categoryId: 'cat-salary',
        date: dateStr,
        time: '08:00',
        notes: 'Gaji bulanan',
        paymentMethod: 'transfer',
        createdAt: date.toISOString(),
      });
    }

    // Daily expenses
    if (i % 2 === 0) {
      transactions.push({
        id: `demo-food-${i}`,
        type: 'expense',
        amount: Math.floor(Math.random() * 50000) + 25000,
        categoryId: 'cat-food',
        date: dateStr,
        time: '12:30',
        notes: 'Makan siang',
        paymentMethod: 'cash',
        createdAt: date.toISOString(),
      });
    }

    if (i % 3 === 0) {
      transactions.push({
        id: `demo-transport-${i}`,
        type: 'expense',
        amount: Math.floor(Math.random() * 30000) + 10000,
        categoryId: 'cat-transport',
        date: dateStr,
        time: '07:30',
        notes: 'Ojek / Transport',
        paymentMethod: 'ewallet',
        createdAt: date.toISOString(),
      });
    }

    if (i % 7 === 0) {
      transactions.push({
        id: `demo-shop-${i}`,
        type: 'expense',
        amount: Math.floor(Math.random() * 200000) + 100000,
        categoryId: 'cat-shopping',
        date: dateStr,
        time: '15:00',
        notes: 'Belanja mingguan',
        paymentMethod: 'debit',
        createdAt: date.toISOString(),
      });
    }

    if (i % 5 === 0) {
      transactions.push({
        id: `demo-drink-${i}`,
        type: 'expense',
        amount: Math.floor(Math.random() * 20000) + 15000,
        categoryId: 'cat-drink',
        date: dateStr,
        time: '09:00',
        notes: 'Kopi pagi',
        paymentMethod: 'ewallet',
        createdAt: date.toISOString(),
      });
    }

    if (i === 5) {
      transactions.push({
        id: `demo-bills-${i}`,
        type: 'expense',
        amount: 350000,
        categoryId: 'cat-bills',
        date: dateStr,
        time: '10:00',
        notes: 'Listrik & Internet',
        paymentMethod: 'transfer',
        createdAt: date.toISOString(),
      });
    }

    if (i === 10) {
      transactions.push({
        id: `demo-freelance-${i}`,
        type: 'income',
        amount: 2500000,
        categoryId: 'cat-freelance',
        date: dateStr,
        time: '14:00',
        notes: 'Project website',
        paymentMethod: 'transfer',
        createdAt: date.toISOString(),
      });
    }

    if (i === 15) {
      transactions.push({
        id: `demo-health-${i}`,
        type: 'expense',
        amount: 150000,
        categoryId: 'cat-health',
        date: dateStr,
        time: '11:00',
        notes: 'Vitamin & suplemen',
        paymentMethod: 'cash',
        createdAt: date.toISOString(),
      });
    }

    if (i === 20) {
      transactions.push({
        id: `demo-ent-${i}`,
        type: 'expense',
        amount: 85000,
        categoryId: 'cat-entertainment',
        date: dateStr,
        time: '20:00',
        notes: 'Netflix subscription',
        paymentMethod: 'credit',
        createdAt: date.toISOString(),
      });
    }
  }

  const currentMonth = today.toISOString().slice(0, 7);
  const budgets: Budget[] = [
    { id: 'demo-budget-1', categoryId: 'cat-food', amount: 1500000, month: currentMonth },
    { id: 'demo-budget-2', categoryId: 'cat-transport', amount: 500000, month: currentMonth },
    { id: 'demo-budget-3', categoryId: 'cat-shopping', amount: 1000000, month: currentMonth },
    { id: 'demo-budget-4', categoryId: 'cat-entertainment', amount: 300000, month: currentMonth },
    { id: 'demo-budget-5', categoryId: 'cat-bills', amount: 600000, month: currentMonth },
  ];

  const savingsGoals: SavingsGoal[] = [
    {
      id: 'demo-goal-1',
      name: 'Liburan Bali',
      targetAmount: 5000000,
      currentAmount: 2500000,
      deadline: new Date(today.getFullYear(), today.getMonth() + 3, 1).toISOString().split('T')[0],
      color: '#10b981',
      icon: '🏖️',
      createdAt: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString(),
      history: [
        { date: new Date(today.getFullYear(), today.getMonth() - 1, 10).toISOString(), amount: 1000000, running: 1000000 },
        { date: new Date(today.getFullYear(), today.getMonth() - 1, 20).toISOString(), amount: 750000, running: 1750000 },
        { date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(), amount: 750000, running: 2500000 },
      ],
    },
    {
      id: 'demo-goal-2',
      name: 'Laptop Baru',
      targetAmount: 15000000,
      currentAmount: 4500000,
      deadline: new Date(today.getFullYear(), today.getMonth() + 6, 1).toISOString().split('T')[0],
      color: '#6366f1',
      icon: '💻',
      createdAt: new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString(),
      history: [
        { date: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString(), amount: 1500000, running: 1500000 },
        { date: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString(), amount: 1500000, running: 3000000 },
        { date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(), amount: 1500000, running: 4500000 },
      ],
    },
    {
      id: 'demo-goal-3',
      name: 'Dana Darurat',
      targetAmount: 30000000,
      currentAmount: 12000000,
      deadline: new Date(today.getFullYear() + 1, today.getMonth(), 1).toISOString().split('T')[0],
      color: '#f59e0b',
      icon: '🛡️',
      createdAt: new Date(today.getFullYear() - 1, today.getMonth(), 1).toISOString(),
      history: [],
    },
  ];

  return { transactions, budgets, savingsGoals };
};
