
import React from 'react';
import { Transaction } from '../types';
import { Trash2, ShoppingBag, Landmark, Heart, TrendingUp as Profit, AlertCircle, HelpCircle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Angsuran KPR': return <Landmark size={18} />;
      case 'Kebutuhan Harian': return <ShoppingBag size={18} />;
      case 'Pemasukan': return <Profit size={18} />;
      case 'Dana Sosial/Cadangan': return <Heart size={18} />;
      case 'Dana Darurat': return <AlertCircle size={18} />;
      default: return <HelpCircle size={18} />;
    }
  };

  const getCategoryColor = (type: string) => {
    return type === 'income' ? 'text-emerald-500 bg-emerald-50' : 'text-indigo-500 bg-indigo-50';
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Transaksi Terakhir</h3>
        <span className="text-sm text-slate-400 font-medium">{transactions.length} Transaksi</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Detail</th>
              <th className="px-6 py-4 font-semibold">Kategori</th>
              <th className="px-6 py-4 font-semibold text-right">Jumlah</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Tidak ada data ditemukan</td>
              </tr>
            ) : (
              sortedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{t.description || 'Tanpa keterangan'}</span>
                      <span className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getCategoryColor(t.type)}`}>
                        {getIcon(t.mainCategory)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-600">{t.mainCategory}</span>
                        {t.subCategory !== 'None' && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.subCategory}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
