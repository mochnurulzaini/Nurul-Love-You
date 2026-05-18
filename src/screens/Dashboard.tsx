import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  formatCurrency, getGreeting, getGreetingEmoji,
  calculateTotals, getCurrentMonthTransactions, getPreviousMonthTransactions,
  getCategoryStats, getWeeklyChartData, percentageChange,
} from '../utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Plus, TrendingUp, TrendingDown, ArrowRight, Lightbulb, Wallet } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import TransactionItem from '../components/ui/TransactionItem';
import TransactionModal from '../components/ui/TransactionModal';
import { dailyQuotes } from '../data/defaultData';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { transactions, categories, budgets, savingsGoals, settings, setActiveTab } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [quoteIdx] = useState(() => new Date().getDay() % dailyQuotes.length);

  const currentMonthTxs = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const prevMonthTxs = useMemo(() => getPreviousMonthTransactions(transactions), [transactions]);

  const currentTotals = useMemo(() => calculateTotals(currentMonthTxs), [currentMonthTxs]);
  const prevTotals = useMemo(() => calculateTotals(prevMonthTxs), [prevMonthTxs]);

  const incomeChange = useMemo(
    () => percentageChange(currentTotals.income, prevTotals.income),
    [currentTotals, prevTotals]
  );
  const expenseChange = useMemo(
    () => percentageChange(currentTotals.expense, prevTotals.expense),
    [currentTotals, prevTotals]
  );

  const allTimeTotals = useMemo(() => calculateTotals(transactions), [transactions]);

  const weeklyData = useMemo(() => getWeeklyChartData(transactions), [transactions]);

  const categoryStats = useMemo(
    () => getCategoryStats(currentMonthTxs, categories, 'expense').slice(0, 5),
    [currentMonthTxs, categories]
  );

  const recentTxs = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  // Budget overview for current month
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyBudgets = useMemo(
    () => budgets.filter((b) => b.month === currentMonth),
    [budgets, currentMonth]
  );

  const totalBudget = monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsed = currentMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const budgetPct = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

  // Savings progress
  const totalSavingsTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSavingsCurrent = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const savingsPct = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;

  // Generate insight
  const insight = useMemo(() => {
    if (categoryStats.length === 0) return null;
    const top = categoryStats[0];
    const cat = categories.find((c) => c.id === top.categoryId);
    return `${cat?.icon || '📊'} Pengeluaran terbesar bulan ini: ${cat?.name || 'Lainnya'} sebesar ${formatCurrency(top.total, true)}`;
  }, [categoryStats, categories]);

  // colors accessed inline in chart Cell components

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setShowModal(true);
  };

  const greeting = getGreeting();
  const greetingEmoji = getGreetingEmoji();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {greetingEmoji} {greeting}!
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: idLocale })}
          </p>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all hover-lift"
            style={{ background: '#d1fae5', color: '#059669' }}
          >
            <Plus size={16} />
            <span className="hidden sm:block">Pemasukan</span>
          </button>
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all hover-lift"
            style={{
              background: 'var(--accent)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(16,185,129,0.35)',
            }}
          >
            <Plus size={16} />
            <span className="hidden sm:block">Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Daily Quote */}
      {settings.dailyQuoteEnabled && (
        <div
          className="p-4 rounded-2xl flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.08) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <Lightbulb size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="text-sm font-medium italic" style={{ color: 'var(--text-primary)' }}>
              "{dailyQuotes[quoteIdx].quote}"
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              — {dailyQuotes[quoteIdx].author}
            </p>
          </div>
        </div>
      )}

      {/* Main Balance Card */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f3460 100%)',
        }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Total Saldo Keseluruhan
            </p>
          </div>
          <div className="text-4xl font-bold text-white mb-4">
            {formatCurrency(allTimeTotals.balance)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} style={{ color: '#10b981' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Pemasukan Bulan Ini</span>
              </div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(currentTotals.income, true)}
              </div>
              {incomeChange !== 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {incomeChange > 0 ? (
                    <TrendingUp size={10} style={{ color: '#10b981' }} />
                  ) : (
                    <TrendingDown size={10} style={{ color: '#ef4444' }} />
                  )}
                  <span className="text-xs" style={{ color: incomeChange > 0 ? '#10b981' : '#ef4444' }}>
                    {Math.abs(incomeChange).toFixed(1)}% vs bulan lalu
                  </span>
                </div>
              )}
            </div>
            <div
              className="p-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={12} style={{ color: '#ef4444' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Pengeluaran Bulan Ini</span>
              </div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(currentTotals.expense, true)}
              </div>
              {expenseChange !== 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {expenseChange < 0 ? (
                    <TrendingDown size={10} style={{ color: '#10b981' }} />
                  ) : (
                    <TrendingUp size={10} style={{ color: '#ef4444' }} />
                  )}
                  <span className="text-xs" style={{ color: expenseChange < 0 ? '#10b981' : '#ef4444' }}>
                    {Math.abs(expenseChange).toFixed(1)}% vs bulan lalu
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Sisa Budget"
          amount={Math.max(0, totalBudget - budgetUsed)}
          subtitle={totalBudget > 0 ? `${budgetPct.toFixed(0)}% terpakai` : 'Belum ada budget'}
          icon="🎯"
          onClick={() => setActiveTab('budget')}
        />
        <StatCard
          title="Total Tabungan"
          amount={totalSavingsCurrent}
          subtitle={`${savingsPct.toFixed(0)}% dari target`}
          icon="🏦"
          onClick={() => setActiveTab('savings')}
        />
        <StatCard
          title="Transaksi Bulan Ini"
          amount={currentMonthTxs.length}
          subtitle="transaksi"
          icon="📊"
        />
        <StatCard
          title="Net Bulan Ini"
          amount={currentTotals.balance}
          change={percentageChange(currentTotals.balance, prevTotals.balance)}
          changeLabel="vs bulan lalu"
          icon="💹"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <div
          className="lg:col-span-2 p-5 rounded-3xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Aktivitas 7 Hari
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Pemasukan vs Pengeluaran
              </p>
            </div>
          </div>

          {weeklyData.some((d) => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}jt` : `${(v/1000).toFixed(0)}rb`}
                />
                <Tooltip
                   formatter={(value) => [formatCurrency(Number(value)), '']}
                   contentStyle={{
                     background: 'var(--bg-card)',
                     border: '1px solid var(--border)',
                     borderRadius: '12px',
                     boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                   }}
                   labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                 />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#colorIncome)"
                  name="Pemasukan"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#colorExpense)"
                  name="Pengeluaran"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center flex-col gap-3">
              <div className="text-4xl">📊</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Belum ada data transaksi
              </p>
              <button
                onClick={() => openModal('expense')}
                className="btn-primary text-sm py-2 px-4"
              >
                Tambah Transaksi
              </button>
            </div>
          )}
        </div>

        {/* Category pie */}
        <div
          className="p-5 rounded-3xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Kategori Terbesar
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Pengeluaran bulan ini
          </p>

          {categoryStats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="total"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                     formatter={(value) => [formatCurrency(Number(value)), '']}
                     contentStyle={{
                       background: 'var(--bg-card)',
                       border: '1px solid var(--border)',
                       borderRadius: '12px',
                     }}
                   />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-2">
                {categoryStats.slice(0, 4).map((stat) => (
                  <div key={stat.categoryId} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: stat.color }}
                    />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                      {stat.icon} {stat.name}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {stat.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center flex-col gap-2">
              <div className="text-3xl">🥧</div>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Belum ada data pengeluaran
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Insight + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Smart insight */}
        {insight && (
          <div
            className="p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🔍</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6366f1' }}>
                Insight Finansial
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{insight}</p>
            {currentTotals.expense > currentTotals.income && (
              <p className="text-xs mt-2" style={{ color: '#ef4444' }}>
                ⚠️ Pengeluaran melebihi pemasukan bulan ini
              </p>
            )}
            {currentTotals.expense < currentTotals.income * 0.7 && currentTotals.income > 0 && (
              <p className="text-xs mt-2" style={{ color: '#10b981' }}>
                ✅ Kamu berhasil menghemat {((1 - currentTotals.expense / currentTotals.income) * 100).toFixed(0)}% dari pemasukan!
              </p>
            )}
          </div>
        )}

        {/* Budget overview */}
        {totalBudget > 0 && (
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                🎯 Budget Bulan Ini
              </span>
              <button
                onClick={() => setActiveTab('budget')}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Detail <ArrowRight size={12} />
              </button>
            </div>
            <div className="progress-bar mb-2">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background:
                    budgetPct >= 90
                      ? '#ef4444'
                      : budgetPct >= 70
                      ? '#f59e0b'
                      : '#10b981',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(budgetUsed, true)} dari {formatCurrency(totalBudget, true)}
              </span>
              <span
                className="font-semibold"
                style={{
                  color:
                    budgetPct >= 90
                      ? '#ef4444'
                      : budgetPct >= 70
                      ? '#f59e0b'
                      : '#10b981',
                }}
              >
                {budgetPct.toFixed(0)}%
              </span>
            </div>
            {budgetPct >= 90 && (
              <p className="text-xs mt-2 font-medium" style={{ color: '#ef4444' }}>
                ⚠️ Budget hampir habis!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Transaksi Terbaru
          </h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Lihat Semua <ArrowRight size={14} />
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <div
            className="p-8 rounded-3xl flex flex-col items-center gap-3 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="text-5xl">💸</div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Belum Ada Transaksi
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Mulai catat pemasukan dan pengeluaranmu
            </p>
            <button
              onClick={() => openModal('expense')}
              className="btn-primary mt-2"
            >
              <Plus size={16} /> Tambah Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="stagger-item animate-fade-in">
                <TransactionItem transaction={tx} compact />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Savings goals overview */}
      {savingsGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Target Tabungan
            </h3>
            <button
              onClick={() => setActiveTab('savings')}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Kelola <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savingsGoals.slice(0, 3).map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-2xl hover-lift cursor-pointer"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onClick={() => setActiveTab('savings')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {goal.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Target: {formatCurrency(goal.targetAmount, true)}
                      </p>
                    </div>
                  </div>
                  <div className="progress-bar mb-2">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: goal.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(goal.currentAmount, true)}
                    </span>
                    <span className="font-semibold" style={{ color: goal.color }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultType={modalType}
      />
    </div>
  );
};

export default Dashboard;
