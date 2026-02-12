
import React, { useState } from 'react';
import { MainCategory, SubCategory, TransactionType, Transaction } from '../types';
import { CATEGORY_MAP } from '../constants';
import { PlusCircle, X, ChevronDown } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (t: Transaction) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, isOpen, onOpenChange }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [mainCategory, setMainCategory] = useState<MainCategory>(MainCategory.DAILY);
  const [subCategory, setSubCategory] = useState<SubCategory>('Makan');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      mainCategory: type === 'income' ? MainCategory.INCOME : mainCategory,
      subCategory: type === 'income' ? 'None' : subCategory,
      amount: Number(amount),
      createdAt: date,
      description
    };

    onAdd(newTransaction);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MainCategory;
    setMainCategory(val);
    setSubCategory(CATEGORY_MAP[val][0]);
  };

  if (!isOpen) return null;

  return (
    <div className="mb-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
        >
          <X size={24} />
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Catat Transaksi</h2>
          <p className="text-slate-500 font-medium">Masukkan rincian pemasukan atau pengeluaran Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Type Switcher */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Jenis Transaksi</label>
              <div className="flex p-1.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3.5 rounded-[1.125rem] text-sm font-bold transition-all duration-200 ${type === 'expense' ? 'bg-white text-red-600 shadow-md border border-red-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-3.5 rounded-[1.125rem] text-sm font-bold transition-all duration-200 ${type === 'income' ? 'bg-white text-emerald-600 shadow-md border border-emerald-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Jumlah Nominal (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">Rp</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-6 py-4.5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white transition-all text-xl placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
            </div>

            {type === 'expense' && (
              <>
                {/* Category Select */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">Kategori Utama</label>
                  <div className="relative">
                    <select
                      value={mainCategory}
                      onChange={handleMainCategoryChange}
                      className="w-full pl-6 pr-12 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-700 font-semibold appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      {Object.values(MainCategory).filter(c => c !== MainCategory.INCOME).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* SubCategory Select */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">Sub Kategori</label>
                  <div className="relative">
                    <select
                      disabled={CATEGORY_MAP[mainCategory].length === 1 && CATEGORY_MAP[mainCategory][0] === 'None'}
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                      className="w-full pl-6 pr-12 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-700 font-semibold appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-50 disabled:bg-slate-100"
                    >
                      {CATEGORY_MAP[mainCategory].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </>
            )}

            {/* Date Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-700 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Keterangan Tambahan</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                placeholder="Contoh: Belanja bulanan di pasar"
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:from-slate-800 hover:to-slate-700 transition-all duration-200 shadow-xl shadow-slate-200/50 active:scale-[0.98] border border-slate-700"
            >
              <span className="flex items-center justify-center gap-2">
                <PlusCircle size={20} />
                Simpan Transaksi
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
