
import React, { useMemo, useState } from 'react';
import { Transaction, MainCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, LayoutGrid, Home, ShoppingBag, ShieldAlert, BadgeDollarSign, Heart, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import { COLORS } from '../constants';
import CategoryTransactions from './CategoryTransactions';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // console.log(transactions, '_transactions');
  
  // Filter transaksi berdasarkan periode kustom: 29 bulan sebelumnya hingga 28 bulan saat ini
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();
    
    // Tentukan periode: 29 bulan sebelumnya hingga 28 bulan saat ini
    let startDate, endDate;
    let displayYear = currentYear;
    let displayMonth = currentMonth;
    
    // Jika tanggal sudah melewati 28, pindah ke bulan berikutnya
    if (currentDay > 28) {
      if (currentMonth === 11) { // Desember, pindah ke Januari tahun berikutnya
        displayYear = currentYear + 1;
        displayMonth = 0;
      } else {
        displayMonth = currentMonth + 1;
      }
    }
    
    // Start date: 29 bulan sebelumnya dari display month
    if (displayMonth === 0) { // Januari
      startDate = new Date(displayYear - 1, 11, 29); // 29 Desember tahun sebelumnya
    } else {
      startDate = new Date(displayYear, displayMonth - 1, 29); // 29 bulan sebelumnya
    }
    
    // End date: 28 bulan display month
    endDate = new Date(displayYear, displayMonth, 28); // 28 bulan display month
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const balance = summary.income - summary.expense;

  const expenseBreakdown = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.mainCategory] = (data[t.mainCategory] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case MainCategory.MORTGAGE: return <Home size={16} className="text-blue-500" />;
      case MainCategory.DAILY: return <ShoppingBag size={16} className="text-orange-500" />;
      case MainCategory.EMERGENCY: return <ShieldAlert size={16} className="text-red-500" />;
      case MainCategory.INVESTMENT: return <BadgeDollarSign size={16} className="text-emerald-500" />;
      case MainCategory.SOCIAL: return <Heart size={16} className="text-pink-500" />;
      case MainCategory.LOAN: return <CreditCard size={16} className="text-amber-500" />;
      default: return <BadgeDollarSign size={16} className="text-slate-500" />;
    }
  };

  const categoryTotals = useMemo(() => {
    const categories = Object.values(MainCategory).filter(c => c !== MainCategory.INCOME);
    return categories.map(cat => {
      const total = filteredTransactions
        .filter(t => t.type === 'expense' && t.mainCategory === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat, total };
    });
  }, [filteredTransactions]);

  const monthlyHistory = useMemo(() => {
    const data: Record<string, { month: string, income: number, expense: number }> = {};
    filteredTransactions.forEach(t => {
      const month = t.createdAt.substring(0, 7);
      if (!data[month]) data[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') data[month].income += t.amount;
      else data[month].expense += t.amount;
    });
    return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const recentTransactions = filteredTransactions.slice(0, 3);

  // Format periode untuk ditampilkan
  const getPeriodDisplay = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let startDate, endDate;
    let displayYear = currentYear;
    let displayMonth = currentMonth;
    
    // Jika tanggal sudah melewati 28, pindah ke bulan berikutnya
    if (currentDay > 28) {
      if (currentMonth === 11) { // Desember, pindah ke Januari tahun berikutnya
        displayYear = currentYear + 1;
        displayMonth = 0;
      } else {
        displayMonth = currentMonth + 1;
      }
    }
    
    // Start date: 29 bulan sebelumnya dari display month
    if (displayMonth === 0) { // Januari
      startDate = new Date(displayYear - 1, 11, 29);
    } else {
      startDate = new Date(displayYear, displayMonth - 1, 29);
    }
    
    // End date: 28 bulan display month
    endDate = new Date(displayYear, displayMonth, 28);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Period Indicator */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Periode Aktif</p>
            <p className="text-sm font-black text-indigo-900">{getPeriodDisplay()}</p>
          </div>
        </div>
        <div className="text-xs font-bold text-indigo-700 bg-indigo-200/50 px-4 py-2 rounded-full border border-indigo-300">
          {filteredTransactions.length} Transaksi
        </div>
      </div>
      {/* Premium Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-950/40 text-white border border-indigo-800/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-300/90">Total Net Worth</span>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              IDR • Indonesia
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black mb-8 tracking-tight">{formatCurrency(balance)}</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-emerald-500/10 backdrop-blur-sm p-5 rounded-3xl border border-emerald-500/30 hover:bg-emerald-500/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30">
                  <ArrowUpRight size={12} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Pemasukan</span>
              </div>
              <p className="font-bold text-xl text-emerald-100">{formatCurrency(summary.income)}</p>
            </div>

            <div className="bg-red-500/10 backdrop-blur-sm p-5 rounded-3xl border border-red-500/30 hover:bg-red-500/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-500 rounded-full text-white shadow-lg shadow-red-500/30">
                  <ArrowDownLeft size={12} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-300">Pengeluaran</span>
              </div>
              <p className="font-bold text-xl text-red-100">{formatCurrency(summary.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll / Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-indigo-600" size={18} />
            <h3 className="font-black text-slate-800 tracking-tight">Alokasi Dana</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryTotals.map((cat) => (
            <div 
              key={cat.name} 
              className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory(cat.name)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-[9px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors">
                  {Math.round(summary.expense > 0 ? (cat.total / summary.expense) * 100 : 0)}%
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                {cat.name}
              </p>
              <p className="text-sm font-black text-slate-800 truncate">
                {formatCurrency(cat.total)}
              </p>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${summary.expense > 0 ? (cat.total / summary.expense) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expenses Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <PieIcon className="text-indigo-600" size={18} />
              <h3 className="font-black text-slate-800 tracking-tight">Komposisi Biaya</h3>
            </div>
          </div>
          <div className="h-[300px]">
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <PieIcon size={40} className="opacity-20" />
                <p className="text-sm font-medium">Belum ada data pengeluaran</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={18} />
              <h3 className="font-black text-slate-800 tracking-tight">Arus Kas Bulanan</h3>
            </div>
          </div>
          <div className="h-[300px]">
            {monthlyHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHistory} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#cbd5e1" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 12 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} iconType="circle" />
                  <Bar dataKey="income" name="Income" fill={COLORS.income} radius={[8, 8, 8, 8]} barSize={20} />
                  <Bar dataKey="expense" name="Expense" fill={COLORS.expense} radius={[8, 8, 8, 8]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <TrendingUp size={40} className="opacity-20" />
                <p className="text-sm font-medium">Data transaksi kosong</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Transactions Modal */}
      {selectedCategory && (
        <CategoryTransactions
          transactions={filteredTransactions}
          categoryName={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          showAsModal={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
