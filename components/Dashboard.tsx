
import React, { useMemo, useState } from 'react';
import { Transaction, MainCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, LayoutGrid, Home, ShoppingBag, ShieldAlert, BadgeDollarSign, Heart, ArrowUpRight, ArrowDownLeft, CreditCard, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F9FA] animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Super App Header */}
      {/* <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1F2937]">UangKita</h1>
              <p className="text-[9px] text-[#6B7280] font-medium">Financial Super App</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-full">
              <span className="text-[10px] font-bold text-[#374151] uppercase tracking-wider">Premium</span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-6xl mx-auto py-4 space-y-6">
        {/* Premium Balance Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-6 shadow-lg border border-emerald-700/20 relative overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSI0IiAvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjAzIiAvPgo8L3N2Zz4=')] opacity-5"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mb-1">Total Balance</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{formatCurrency(balance)}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold text-white">IDR</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-400 rounded-lg flex items-center justify-center">
                    <ArrowUpRight size={12} className="text-white" />
                  </div>
                  <span className="text-[9px] font-medium text-emerald-100">Income</span>
                </div>
                <p className="text-lg font-bold text-white">{formatCurrency(summary.income)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-400 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft size={12} className="text-white" />
                  </div>
                  <span className="text-[9px] font-medium text-emerald-100">Expense</span>
                </div>
                <p className="text-lg font-bold text-white">{formatCurrency(summary.expense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB]">
          <h3 className="text-sm font-bold text-[#1F2937] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Plus size={18} className="text-emerald-600" />
              </div>
              <span className="text-[10px] font-medium text-[#374151]">Top Up</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard size={18} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-medium text-[#374151]">Transfer</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <LayoutGrid size={18} className="text-purple-600" />
              </div>
              <span className="text-[10px] font-medium text-[#374151]">Budget</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-orange-600" />
              </div>
              <span className="text-[10px] font-medium text-[#374151]">History</span>
            </button>
          </div>
        </div>

        {/* Period Indicator */}
        {/* <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Active Period</p>
              <p className="text-sm font-bold text-[#1F2937]">{getPeriodDisplay()}</p>
            </div>
          </div>
          <div className="bg-emerald-100 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-emerald-700">{filteredTransactions.length} Transactions</span>
          </div>
        </div> */}

      {/* Budget Categories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="text-emerald-600" size={18} />
              <h3 className="font-bold text-[#1F2937] tracking-tight">Budget Categories</h3>
            </div>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">See All</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryTotals.map((cat) => (
              <div 
                key={cat.name} 
                className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedCategory(cat.name)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-[#F9FAFB] rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="text-[9px] font-bold text-[#6B7280] group-hover:text-emerald-600 transition-colors">
                    {Math.round(summary.expense > 0 ? (cat.total / summary.expense) * 100 : 0)}%
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[#374151] uppercase tracking-wider mb-1 truncate">
                  {cat.name}
                </p>
                <p className="text-sm font-bold text-[#1F2937] truncate">
                  {formatCurrency(cat.total)}
                </p>
                <div className="mt-3 h-1 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${summary.expense > 0 ? (cat.total / summary.expense) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Chart */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PieIcon className="text-emerald-600" size={18} />
                <h3 className="font-bold text-[#1F2937] tracking-tight">Expense Breakdown</h3>
              </div>
            </div>
            <div className="h-[280px]">
              {expenseBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '10px 14px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] space-y-2">
                  <PieIcon size={40} className="opacity-20" />
                  <p className="text-sm font-medium">No expense data</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={18} />
                <h3 className="font-bold text-[#1F2937] tracking-tight">Monthly Trend</h3>
              </div>
            </div>
            <div className="h-[280px]">
              {monthlyHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="month" 
                      stroke="#E5E7EB" 
                      fontSize={10} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: '#F9FAFB', radius: 8 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '10px 14px' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} 
                      iconType="circle" 
                    />
                    <Bar 
                      dataKey="income" 
                      name="Income" 
                      fill={COLORS.income} 
                      radius={[6, 6, 6, 6]} 
                      barSize={16} 
                    />
                    <Bar 
                      dataKey="expense" 
                      name="Expense" 
                      fill={COLORS.expense} 
                      radius={[6, 6, 6, 6]} 
                      barSize={16} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] space-y-2">
                  <TrendingUp size={40} className="opacity-20" />
                  <p className="text-sm font-medium">No transaction data</p>
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
    </div>
  );
};

export default Dashboard;
