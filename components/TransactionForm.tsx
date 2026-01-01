
import React, { useState } from 'react';
import { MainCategory, SubCategory, TransactionType, Transaction } from '../types';
import { CATEGORY_MAP } from '../constants';
import { PlusCircle, X } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (t: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      date,
      description
    };

    onAdd(newTransaction);
    setIsOpen(false);
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

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <PlusCircle size={20} />
          Tambah Transaksi
        </button>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-lg font-bold mb-4 text-slate-800">Transaksi Baru</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Jenis</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${type === 'expense' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                  Pengeluaran
                </button>
                <button 
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Jumlah (Rp)</label>
              <input 
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Contoh: 50000"
              />
            </div>

            {type === 'expense' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-500">Kategori</label>
                  <select 
                    value={mainCategory}
                    onChange={handleMainCategoryChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {Object.values(MainCategory).filter(c => c !== MainCategory.INCOME).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-500">Sub Kategori</label>
                  <select 
                    disabled={CATEGORY_MAP[mainCategory].length === 1 && CATEGORY_MAP[mainCategory][0] === 'None'}
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                  >
                    {CATEGORY_MAP[mainCategory].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Tanggal</label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Keterangan</label>
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Misal: Makan siang di Warteg"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TransactionForm;
