import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Transaction } from '../types';
import { filterByPeriod, formatDate } from '../utils/helpers';
import { Plus, Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import TransactionItem from '../components/ui/TransactionItem';
import TransactionModal from '../components/ui/TransactionModal';

type SortBy = 'newest' | 'oldest' | 'largest' | 'smallest';

const Transactions: React.FC = () => {
  const {
    transactions, categories,
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    filterType, setFilterType,
    filterPeriod, setFilterPeriod,
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let txs = [...transactions];

    // Period filter
    txs = filterByPeriod(txs, filterPeriod);

    // Type filter
    if (filterType !== 'all') txs = txs.filter((t) => t.type === filterType);

    // Category filter
    if (filterCategory !== 'all') txs = txs.filter((t) => t.categoryId === filterCategory);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      txs = txs.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return (
          cat?.name.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        txs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'largest':
        txs.sort((a, b) => b.amount - a.amount);
        break;
      case 'smallest':
        txs.sort((a, b) => a.amount - b.amount);
        break;
    }

    return txs;
  }, [transactions, filterPeriod, filterType, filterCategory, searchQuery, sortBy, categories]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [filtered]);

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setShowModal(true);
  };

  const hasActiveFilters =
    filterType !== 'all' ||
    filterCategory !== 'all' ||
    filterPeriod !== 'month' ||
    sortBy !== 'newest';

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterPeriod('month');
    setSortBy('newest');
    setSearchQuery('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Transaksi
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} transaksi ditemukan
          </p>
        </div>
        <button
          onClick={() => { setEditTx(null); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus size={16} />
          <span className="hidden sm:block">Tambah</span>
        </button>
      </div>

      {/* Search & filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
              hasActiveFilters ? '' : ''
            }`}
            style={
              hasActiveFilters
                ? { background: 'var(--accent)', color: 'white', border: '1.5px solid var(--accent)' }
                : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }
            }
          >
            <SlidersHorizontal size={15} />
            Filter
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-white text-emerald-600 text-xs flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div
            className="p-4 rounded-2xl space-y-3 animate-fade-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Filter & Sortir
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  Reset semua
                </button>
              )}
            </div>

            {/* Period */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Periode
              </p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'today', 'week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPeriod(p)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={
                      filterPeriod === p
                        ? { background: 'var(--accent)', color: 'white' }
                        : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }
                  >
                    {p === 'all' ? 'Semua' : p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu Ini' : p === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Jenis
              </p>
              <div className="flex gap-2">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={
                      filterType === t
                        ? { background: t === 'income' ? '#10b981' : t === 'expense' ? '#ef4444' : 'var(--accent)', color: 'white' }
                        : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }
                  >
                    {t === 'all' ? '📊 Semua' : t === 'income' ? '💰 Pemasukan' : '💸 Pengeluaran'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Urutkan
              </p>
              <div className="flex flex-wrap gap-2">
                {(['newest', 'oldest', 'largest', 'smallest'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={
                      sortBy === s
                        ? { background: '#6366f1', color: 'white' }
                        : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }
                  >
                    {s === 'newest' ? '🕐 Terbaru' : s === 'oldest' ? '📅 Terlama' : s === 'largest' ? '⬆️ Terbesar' : '⬇️ Terkecil'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Kategori
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={
                    filterCategory === 'all'
                      ? { background: 'var(--accent)', color: 'white' }
                      : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={
                      filterCategory === cat.id
                        ? { background: cat.color, color: 'white' }
                        : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction list */}
      {grouped.length === 0 ? (
        <div
          className="p-12 rounded-3xl flex flex-col items-center gap-3 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl">🔍</div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Transaksi Tidak Ditemukan
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {searchQuery ? 'Coba kata kunci lain' : 'Belum ada transaksi untuk filter ini'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary mt-2 text-sm py-2 px-4">
              Hapus Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatDate(date, 'EEEE, dd MMMM yyyy')}
                </p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {txs.length} transaksi
                </span>
              </div>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div key={tx.id} className="animate-fade-in">
                    <TransactionItem
                      transaction={tx}
                      onEdit={handleEdit}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTx(null); }}
        editTransaction={editTx}
      />
    </div>
  );
};

export default Transactions;
