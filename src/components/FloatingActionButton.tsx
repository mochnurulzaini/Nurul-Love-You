import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import TransactionModal from './ui/TransactionModal';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');

  const openTx = (type: 'income' | 'expense') => {
    setTxType(type);
    setIsOpen(false);
    setShowModal(true);
  };

  return (
    <>
      {/* FAB container */}
      <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-3">
        {/* Sub buttons */}
        {isOpen && (
          <>
            <div className="flex items-center gap-3 animate-slide-right">
              <span className="text-xs font-bold px-3 py-1 rounded-xl" style={{ background: 'var(--bg-card)', color: '#10b981', border: '1px solid var(--border)' }}>
                Pemasukan
              </span>
              <button
                onClick={() => openTx('income')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110"
                style={{ background: '#10b981' }}
              >
                <TrendingUp size={20} color="white" />
              </button>
            </div>
            <div className="flex items-center gap-3 animate-slide-right" style={{ animationDelay: '50ms' }}>
              <span className="text-xs font-bold px-3 py-1 rounded-xl" style={{ background: 'var(--bg-card)', color: '#ef4444', border: '1px solid var(--border)' }}>
                Pengeluaran
              </span>
              <button
                onClick={() => openTx('expense')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110"
                style={{ background: '#ef4444' }}
              >
                <TrendingDown size={20} color="white" />
              </button>
            </div>
          </>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 animate-pulse-glow"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.5)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'all 0.2s ease',
          }}
        >
          {isOpen ? <X size={24} color="white" /> : <Plus size={24} color="white" />}
        </button>
      </div>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultType={txType}
      />
    </>
  );
};

export default FloatingActionButton;
