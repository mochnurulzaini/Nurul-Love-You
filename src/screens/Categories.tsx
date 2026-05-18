import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Category } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/helpers';
import { Plus, Trash2, Edit2, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense' | 'both'>('expense');
  const [catIcon, setCatIcon] = useState('📦');
  const [catColor, setCatColor] = useState('#10b981');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdd = () => {
    setEditCat(null);
    setCatName('');
    setCatType('expense');
    setCatIcon('📦');
    setCatColor('#10b981');
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!catName.trim()) errs.name = 'Nama kategori diperlukan';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editCat) {
      updateCategory(editCat.id, { name: catName.trim(), type: catType, icon: catIcon, color: catColor });
      toast.success('Kategori diperbarui ✅');
    } else {
      addCategory({ name: catName.trim(), type: catType, icon: catIcon, color: catColor });
      toast.success('Kategori ditambahkan 🎉');
    }
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    const usageCount = transactions.filter((t) => t.categoryId === cat.id).length;
    if (usageCount > 0) {
      toast.error(`Tidak bisa dihapus: digunakan ${usageCount} transaksi`);
      return;
    }
    deleteCategory(cat.id);
    toast.success('Kategori dihapus');
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter((c) => c.type === 'income' || c.type === 'both');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Kategori</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{categories.length} kategori total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Expense categories */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          💸 Pengeluaran ({expenseCategories.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {expenseCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl hover-lift group"
              style={{ background: 'var(--bg-card)', border: `1.5px solid ${cat.color}20` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={11} />
                  </button>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: '#fee2e2', color: '#ef4444' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {transactions.filter((t) => t.categoryId === cat.id).length} transaksi
                </span>
                {cat.isDefault && <Lock size={9} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income categories */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          💰 Pemasukan ({incomeCategories.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {incomeCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl hover-lift group"
              style={{ background: 'var(--bg-card)', border: `1.5px solid ${cat.color}20` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={11} />
                  </button>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: '#fee2e2', color: '#ef4444' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {transactions.filter((t) => t.categoryId === cat.id).length} transaksi
                </span>
                {cat.isDefault && <Lock size={9} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-y-auto animate-scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '90vh' }}
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editCat ? 'Edit Kategori' : 'Kategori Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Preview */}
              <div className="flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg transition-all"
                  style={{ background: `${catColor}20`, border: `2px solid ${catColor}40` }}
                >
                  {catIcon}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="input-base"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Jenis</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['expense', 'income', 'both'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCatType(t)}
                      className="py-2.5 rounded-xl font-medium text-sm transition-all"
                      style={
                        catType === t
                          ? { background: catColor, color: 'white' }
                          : { background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }
                      }
                    >
                      {t === 'expense' ? '💸 Pengeluaran' : t === 'income' ? '💰 Pemasukan' : '🔄 Keduanya'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Ikon</label>
                <div className="grid grid-cols-9 gap-1.5 max-h-40 overflow-y-auto">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setCatIcon(icon)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                      style={
                        catIcon === icon
                          ? { background: `${catColor}20`, border: `2px solid ${catColor}` }
                          : { background: 'var(--bg-primary)', border: '2px solid transparent' }
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Warna</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCatColor(color)}
                      className="w-9 h-9 rounded-xl transition-all"
                      style={{
                        background: color,
                        border: catColor === color ? '3px solid var(--text-primary)' : '3px solid transparent',
                        transform: catColor === color ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: catColor }}
              >
                {catIcon} {editCat ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
