import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  getMonthlyChartData, getCategoryStats, getWeeklyChartData,
  calculateTotals, getCurrentMonthTransactions, getPreviousMonthTransactions,
  formatCurrency, percentageChange, formatDate,
} from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

type Period = 'week' | 'month' | '6months' | 'year';

const Analytics: React.FC = () => {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<Period>('month');
  const [chartType, setChartType] = useState<'bar' | 'area' | 'line'>('bar');

  const currentMonthTxs = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const prevMonthTxs = useMemo(() => getPreviousMonthTransactions(transactions), [transactions]);

  const currentTotals = useMemo(() => calculateTotals(currentMonthTxs), [currentMonthTxs]);
  const prevTotals = useMemo(() => calculateTotals(prevMonthTxs), [prevMonthTxs]);

  const weeklyData = useMemo(() => getWeeklyChartData(transactions), [transactions]);
  const monthlyData = useMemo(() => getMonthlyChartData(transactions), [transactions]);

  const chartData = period === 'week' || period === 'month' ? weeklyData : monthlyData;

  const expenseCategoryStats = useMemo(
    () => getCategoryStats(currentMonthTxs, categories, 'expense'),
    [currentMonthTxs, categories]
  );

  const incomeCategoryStats = useMemo(
    () => getCategoryStats(currentMonthTxs, categories, 'income'),
    [currentMonthTxs, categories]
  );

  // Generate insights
  const insights = useMemo(() => {
    const list: string[] = [];
    const incChange = percentageChange(currentTotals.income, prevTotals.income);
    const expChange = percentageChange(currentTotals.expense, prevTotals.expense);

    if (incChange > 0) list.push(`📈 Pemasukan meningkat ${incChange.toFixed(1)}% dari bulan lalu`);
    else if (incChange < 0) list.push(`📉 Pemasukan menurun ${Math.abs(incChange).toFixed(1)}% dari bulan lalu`);

    if (expChange < 0) list.push(`✅ Pengeluaran berhasil dikurangi ${Math.abs(expChange).toFixed(1)}% dari bulan lalu`);
    else if (expChange > 0) list.push(`⚠️ Pengeluaran meningkat ${expChange.toFixed(1)}% dari bulan lalu`);

    if (expenseCategoryStats.length > 0) {
      const top = expenseCategoryStats[0];
      const cat = categories.find((c) => c.id === top.categoryId);
      list.push(`🏆 Kategori terbesar: ${cat?.name || 'Lainnya'} (${top.percentage.toFixed(0)}% dari total pengeluaran)`);
    }

    if (currentTotals.balance > 0) {
      const savingsRate = (currentTotals.balance / currentTotals.income * 100);
      if (savingsRate > 20) list.push(`💰 Tingkat tabungan ${savingsRate.toFixed(0)}% — Sangat baik!`);
      else if (savingsRate > 0) list.push(`💡 Tingkat tabungan ${savingsRate.toFixed(0)}% — Coba tingkatkan ke 20%`);
    }

    if (currentTotals.expense > currentTotals.income && currentTotals.income > 0) {
      list.push(`🚨 Pengeluaran melebihi pemasukan bulan ini`);
    }

    return list;
  }, [currentTotals, prevTotals, expenseCategoryStats, categories]);

  const safeFormatter = (value: unknown) => {
    const num = Number(value);
    if (isNaN(num)) return '';
    return num >= 1000000 ? `${(num / 1000000).toFixed(1)}jt` : `${(num / 1000).toFixed(0)}rb`;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analitik</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(), 'MMMM yyyy', { locale: idLocale })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Pemasukan',
            value: currentTotals.income,
            prev: prevTotals.income,
            color: '#10b981',
            icon: '📈',
          },
          {
            label: 'Total Pengeluaran',
            value: currentTotals.expense,
            prev: prevTotals.expense,
            color: '#ef4444',
            icon: '📉',
          },
          {
            label: 'Net Cashflow',
            value: currentTotals.balance,
            prev: prevTotals.balance,
            color: '#6366f1',
            icon: '💹',
          },
          {
            label: 'Jml Transaksi',
            value: currentMonthTxs.length,
            prev: prevMonthTxs.length,
            color: '#f59e0b',
            icon: '📊',
            isCurrency: false,
          },
        ].map((item) => {
          const change = percentageChange(item.value, item.prev);
          return (
            <div
              key={item.label}
              className="p-4 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {item.isCurrency === false ? item.value : formatCurrency(item.value, true)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {change > 0 ? (
                  <TrendingUp size={10} style={{ color: item.color }} />
                ) : change < 0 ? (
                  <TrendingDown size={10} style={{ color: item.color }} />
                ) : (
                  <Minus size={10} style={{ color: 'var(--text-muted)' }} />
                )}
                <span
                  className="text-xs font-semibold"
                  style={{ color: change !== 0 ? item.color : 'var(--text-muted)' }}
                >
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs bln lalu</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div
        className="p-5 rounded-3xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Grafik Keuangan
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Period selector */}
            <div
              className="flex p-1 rounded-xl gap-1"
              style={{ background: 'var(--bg-primary)' }}
            >
              {(['week', 'month', '6months', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={
                    period === p
                      ? { background: 'var(--accent)', color: 'white' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  {p === 'week' ? '7H' : p === 'month' ? '1B' : p === '6months' ? '6B' : '1T'}
                </button>
              ))}
            </div>

            {/* Chart type */}
            <div
              className="flex p-1 rounded-xl gap-1"
              style={{ background: 'var(--bg-primary)' }}
            >
              {(['bar', 'area', 'line'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setChartType(ct)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={
                    chartType === ct
                      ? { background: '#6366f1', color: 'white' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  {ct === 'bar' ? '📊' : ct === 'area' ? '📈' : '📉'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chartData.some((d) => d.income > 0 || d.expense > 0) ? (
          <ResponsiveContainer width="100%" height={260}>
            {chartType === 'bar' ? (
              <BarChart data={chartData} barGap={4} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={safeFormatter} />
                <Tooltip
                  formatter={(val) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Pengeluaran" />
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={safeFormatter} />
                <Tooltip
                  formatter={(val) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#aIncome)" name="Pemasukan" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#aExpense)" name="Pengeluaran" />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={safeFormatter} />
                <Tooltip
                  formatter={(val) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Pemasukan" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="Pengeluaran" />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col gap-3">
            <div className="text-5xl">📊</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada data untuk ditampilkan</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense breakdown */}
        <div
          className="p-5 rounded-3xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            💸 Rincian Pengeluaran
          </h3>
          {expenseCategoryStats.length > 0 ? (
            <div className="space-y-3">
              {expenseCategoryStats.map((stat) => (
                <div key={stat.categoryId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {stat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(stat.total, true)}
                      </span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                        {stat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${stat.percentage}%`, background: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada pengeluaran bulan ini</p>
            </div>
          )}
        </div>

        {/* Income breakdown */}
        <div
          className="p-5 rounded-3xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            💰 Rincian Pemasukan
          </h3>
          {incomeCategoryStats.length > 0 ? (
            <div className="space-y-3">
              {incomeCategoryStats.map((stat) => (
                <div key={stat.categoryId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {stat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(stat.total, true)}
                      </span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                        {stat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${stat.percentage}%`, background: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada pemasukan bulan ini</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div
          className="p-5 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.12)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🤖</span>
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Insight Otomatis
            </h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl animate-fade-in stagger-item"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
