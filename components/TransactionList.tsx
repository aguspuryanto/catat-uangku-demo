import React from 'react';
import { Transaction } from '../types';
import { Trash2, ShoppingBag, Landmark, Heart, TrendingUp as Profit, AlertCircle, HelpCircle, FileDown, ChevronRight, Calendar, Plus } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isConnected?: boolean | null;
  onAddTransaction: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, isConnected, onAddTransaction }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };
  // ... (keep helper functions getIcon and getCategoryColor)

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

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Tanggal', 'Jenis', 'Kategori Utama', 'Sub Kategori', 'Keterangan', 'Jumlah'];
    const rows = sortedTransactions.map(t => [
      t.createdAt,
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

  // Add this state at the top of your component
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  // Add this function inside your component
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="space-y-6">
      {/* check connection to supabase, if not connected, show error message */}
      {isConnected === false && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">Gagal terhubung ke Supabase. Data mungkin tidak tersimpan.</span>
        </div>
      )}
      {isConnected === true && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold">Terhubung ke Supabase.</span>
        </div>
      )}

      {/* List Header */}
      <div className="flex flex-row justify-between items-end px-2">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Riwayat</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{transactions.length} Records</p>
        </div>
        <div className="flex bg-indigo-50 rounded-2xl overflow-hidden">
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-none text-xs font-black tracking-widest uppercase transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Tambah</span>
          </button>
          <div className="w-px bg-indigo-200 my-2"></div>
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-none text-xs font-black tracking-widest uppercase transition-all disabled:opacity-30 disabled:grayscale"
          >
            <FileDown size={14} strokeWidth={3} />
            <span>Export</span>
          </button>
        </div>
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
                        <Calendar size={10} /> {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
      <div className="md:hidden -mx-4">
        {sortedTransactions.length === 0 ? (
          <div className="bg-white p-12 mx-4 rounded-2xl text-center text-slate-300 font-bold">
            Tidak ada transaksi
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedTransactions.map((t) => (
              <div 
                key={t.id} 
                className={`px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl border-b transition-colors ${t.type === 'expense' ? 'bg-red-50 active:bg-red-100 border-red-100' : 'bg-white active:bg-slate-50 border-slate-100'}`}
                onClick={() => handleTransactionClick(t)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-2xl shrink-0 ${getCategoryColor(t.type)}`}>
                    {getIcon(t.mainCategory)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className={`font-bold text-sm truncate pr-2 ${t.type === 'expense' ? 'text-red-600' : 'text-slate-800'}`}>
                        {t.description || t.mainCategory}
                      </h4>
                      <span className={`font-bold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-600' : 'text-slate-900'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs whitespace-nowrap ${t.type === 'expense' ? 'text-red-400' : 'text-slate-500'}`}>
                          {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${t.type === 'expense' ? 'text-red-500' : 'text-indigo-500'}`}>
                        {t.mainCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Transaction Modal */}
      {selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-black text-slate-800">Detail Transaksi</h2>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-3xl ${getCategoryColor(selectedTransaction.type)}`}>
                  {getIcon(selectedTransaction.mainCategory)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">
                    {selectedTransaction.description || selectedTransaction.mainCategory}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {new Date(selectedTransaction.createdAt).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah</span>
                  <span className={`font-black ${selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'} {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori</span>
                  <span className="font-medium text-slate-800">{selectedTransaction.mainCategory}</span>
                </div>
                {selectedTransaction.subCategory && selectedTransaction.subCategory !== 'None' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sub Kategori</span>
                    <span className="font-medium text-slate-800">{selectedTransaction.subCategory}</span>
                  </div>
                )}
                {selectedTransaction.notes && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-slate-500 mb-2">Catatan</h4>
                    <p className="text-slate-800">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>
              {/* <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    onDelete(selectedTransaction.id);
                    setSelectedTransaction(null);
                  }}
                  className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Hapus Transaksi
                </button>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
