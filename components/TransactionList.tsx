
import React, { useState, useMemo } from 'react';
import { Transaction, MainCategory } from '../types';
import { 
  Trash2, ShoppingBag, Landmark, Heart, TrendingUp as Profit, 
  AlertCircle, HelpCircle, FileDown, Calendar, Filter, 
  ArrowUpDown, XCircle, Search
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Logic for Filtering & Sorting
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (searchQuery) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.mainCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(t => t.mainCategory === filterCategory);
    }

    // Date range filter
    if (startDate) {
      result = result.filter(t => t.date >= startDate);
    }
    if (endDate) {
      result = result.filter(t => t.date <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        default: return 0;
      }
    });

    return result;
  }, [transactions, filterType, filterCategory, startDate, endDate, sortBy, searchQuery]);

  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.mainCategory)));
  }, [transactions]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
    setSearchQuery('');
  };

  const exportToCSV = () => {
    if (filteredAndSortedTransactions.length === 0) return;
    const headers = ['Tanggal', 'Jenis', 'Kategori Utama', 'Sub Kategori', 'Keterangan', 'Jumlah'];
    const rows = filteredAndSortedTransactions.map(t => [
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
    link.setAttribute('download', `transaksi_uang_kita_filtered_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Riwayat Transaksi</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filteredAndSortedTransactions.length} dari {transactions.length} Data Ditampilkan
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all flex-1 sm:flex-none border-2 ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200'}`}
          >
            <Filter size={14} strokeWidth={3} />
            <span>Filter</span>
          </button>
          
          <button 
            onClick={exportToCSV}
            disabled={filteredAndSortedTransactions.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-indigo-600 border-2 border-slate-100 rounded-2xl text-xs font-black tracking-widest uppercase transition-all disabled:opacity-30 disabled:grayscale flex-1 sm:flex-none"
          >
            <FileDown size={14} strokeWidth={3} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Pengaturan Pencarian</h4>
            <button onClick={resetFilters} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
              <XCircle size={14} /> Reset Semua
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cari Keterangan</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jenis</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm font-semibold"
              >
                <option value="all">Semua Jenis</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm font-semibold"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Urutkan</label>
              <div className="relative">
                <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm font-semibold appearance-none"
                >
                  <option value="date-desc">Terbaru</option>
                  <option value="date-asc">Terlama</option>
                  <option value="amount-desc">Nominal Terbesar</option>
                  <option value="amount-asc">Nominal Terkecil</option>
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dari Tanggal</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sampai Tanggal</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-500">
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
            {filteredAndSortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                      <Search size={48} strokeWidth={1} />
                    </div>
                    <p className="text-slate-300 font-bold uppercase tracking-widest">Tidak ada data yang cocok dengan kriteria filter</p>
                    {transactions.length > 0 && (
                      <button onClick={resetFilters} className="text-indigo-500 font-black text-xs uppercase tracking-widest">Reset Filter</button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{t.description || 'Tanpa Keterangan'}</span>
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
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100">
             <p className="text-slate-300 font-black uppercase tracking-widest">Kosong</p>
             <button onClick={resetFilters} className="mt-4 text-indigo-500 font-black text-xs uppercase tracking-widest">Reset Filter</button>
          </div>
        ) : (
          filteredAndSortedTransactions.map((t) => (
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
