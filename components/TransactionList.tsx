
import React from 'react';
import { Transaction } from '../types';
import { Trash2, ShoppingBag, Landmark, Heart, TrendingUp as Profit, AlertCircle, HelpCircle, FileDown, ChevronRight, Calendar } from 'lucide-react';

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
      case 'Angsuran KPR': return <Landmark size={20} />;
      case 'Kebutuhan Harian': return <ShoppingBag size={20} />;
      case 'Pemasukan': return <Profit size={20} />;
      case 'Dana Sosial/Cadangan': return <Heart size={20} />;
      case 'Dana Darurat': return <AlertCircle size={20} />;
      default: return <HelpCircle size={20} />;
    }
  };

  const getCategoryColor = (type: string) => {
    return type === 'income' ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 bg-indigo-50';
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Tanggal', 'Jenis', 'Kategori Utama', 'Sub Kategori', 'Keterangan', 'Jumlah'];
    const rows = sortedTransactions.map(t => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.mainCategory,
      t.subCategory === 'None' ? '-' : t.subCategory,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transaksi_uang_kita_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex flex-row justify-between items-end px-2">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Riwayat</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{transactions.length} Records</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl text-xs font-black tracking-widest uppercase transition-all disabled:opacity-30 disabled:grayscale"
        >
          <FileDown size={14} strokeWidth={3} />
          <span>Export</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
              <th className="px-8 py-5 font-black">Information</th>
              <th className="px-8 py-5 font-black">Category</th>
              <th className="px-8 py-5 font-black text-right">Amount</th>
              <th className="px-8 py-5 font-black text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedTransactions.length === 0 ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">No transactions recorded yet</td></tr>
            ) : (
              sortedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{t.description || 'No Description'}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <Calendar size={10} /> {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${getCategoryColor(t.type)}`}>
                        {getIcon(t.mainCategory)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 tracking-tight">{t.mainCategory}</span>
                        {t.subCategory !== 'None' && <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.subCategory}</span>}
                      </div>
                    </div>
                  </td>
                  <td className={`px-8 py-5 text-right font-black text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={() => onDelete(t.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedTransactions.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center text-slate-300 font-black uppercase tracking-widest border border-slate-100">Empty</div>
        ) : (
          sortedTransactions.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all">
              <div className={`p-4 rounded-3xl shrink-0 ${getCategoryColor(t.type)} shadow-sm`}>
                {getIcon(t.mainCategory)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-slate-800 truncate pr-2 tracking-tight">{t.description || t.mainCategory}</h4>
                  <span className={`font-black shrink-0 text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {t.date}
                  </span>
                  <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">
                    {t.mainCategory}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onDelete(t.id)}
                className="p-3 text-red-200 active:text-red-500 active:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;
