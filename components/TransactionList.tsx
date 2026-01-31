import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { Trash2, ShoppingBag, Landmark, Heart, TrendingUp as Profit, AlertCircle, HelpCircle, FileDown, ChevronRight, Calendar, Plus, ChevronDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isConnected?: boolean | null;
  onAddTransaction: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, isConnected, onAddTransaction }) => {
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0); // 0 = periode aktif, 1 = periode sebelumnya, dst
  
  // Helper function untuk mendapatkan periode berdasarkan index
  const getPeriodDates = (periodIndex: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let startDate, endDate;
    let displayYear = currentYear;
    let displayMonth = currentMonth;
    
    // Tentukan bulan display berdasarkan periode index
    if (currentDay > 28) {
      if (currentMonth === 11) {
        displayYear = currentYear + 1;
        displayMonth = 0;
      } else {
        displayMonth = currentMonth + 1;
      }
    }
    
    // Mundur sebanyak periodIndex bulan
    for (let i = 0; i < periodIndex; i++) {
      if (displayMonth === 0) {
        displayYear = displayYear - 1;
        displayMonth = 11;
      } else {
        displayMonth = displayMonth - 1;
      }
    }
    
    // Start date: 29 bulan sebelumnya dari display month
    if (displayMonth === 0) {
      startDate = new Date(displayYear - 1, 11, 29);
    } else {
      startDate = new Date(displayYear, displayMonth - 1, 29);
    }
    
    // End date: 28 bulan display month
    endDate = new Date(displayYear, displayMonth, 28);
    
    return { startDate, endDate, displayYear, displayMonth };
  };
  
  // Generate options untuk dropdown (1 tahun ke belakang = 12 periode)
  const getPeriodOptions = () => {
    const options = [];
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    for (let i = 0; i < 12; i++) {
      const { displayYear, displayMonth } = getPeriodDates(i);
      const label = i === 0 ? 'Periode Aktif' : `${monthNames[displayMonth]} ${displayYear}`;
      options.push({ value: i, label });
    }
    
    return options;
  };
  
  // Filter transaksi berdasarkan periode yang dipilih
  const filteredTransactions = useMemo(() => {
    const { startDate, endDate } = getPeriodDates(selectedPeriodIndex);
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, selectedPeriodIndex]);
  
  // Format periode untuk ditampilkan
  const getPeriodDisplay = (periodIndex: number) => {
    const { startDate, endDate } = getPeriodDates(periodIndex);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`;
  };
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

  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 px-2">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Riwayat</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredTransactions.length} Records</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPeriodIndex}
              onChange={(e) => setSelectedPeriodIndex(Number(e.target.value))}
              className="appearance-none bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 pr-10 text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer min-w-[180px]"
              size="1"
            >
              {getPeriodOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 pointer-events-none" />
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
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-none text-xs font-black tracking-widest uppercase transition-all disabled:opacity-30 disabled:grayscale"
            >
              <FileDown size={14} strokeWidth={3} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Period Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500 rounded-full">
            <Calendar size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {selectedPeriodIndex === 0 ? 'Periode Aktif' : getPeriodOptions()[selectedPeriodIndex].label}
            </p>
            <p className="text-sm font-black text-indigo-900">
              {getPeriodDisplay(selectedPeriodIndex)}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
          {filteredTransactions.length} Transaksi
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
