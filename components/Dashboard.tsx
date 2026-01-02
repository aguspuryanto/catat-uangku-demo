
import React, { useMemo } from 'react';
import { Transaction, MainCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, LayoutGrid, Home, ShoppingBag, ShieldAlert, BadgeDollarSign, Heart, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { COLORS } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const summary = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = summary.income - summary.expense;

  const expenseBreakdown = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.mainCategory] = (data[t.mainCategory] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case MainCategory.MORTGAGE: return <Home size={16} className="text-blue-500" />;
      case MainCategory.DAILY: return <ShoppingBag size={16} className="text-orange-500" />;
      case MainCategory.EMERGENCY: return <ShieldAlert size={16} className="text-red-500" />;
      case MainCategory.INVESTMENT: return <BadgeDollarSign size={16} className="text-emerald-500" />;
      case MainCategory.SOCIAL: return <Heart size={16} className="text-pink-500" />;
      default: return <BadgeDollarSign size={16} className="text-slate-500" />;
    }
  };

  const categoryTotals = useMemo(() => {
    const categories = Object.values(MainCategory).filter(c => c !== MainCategory.INCOME);
    return categories.map(cat => {
      const total = transactions
        .filter(t => t.type === 'expense' && t.mainCategory === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat, total };
    });
  }, [transactions]);

  const monthlyHistory = useMemo(() => {
    const data: Record<string, { month: string, income: number, expense: number }> = {};
    transactions.forEach(t => {
      const month = t.createdAt.substring(0, 7);
      if (!data[month]) data[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') data[month].income += t.amount;
      else data[month].expense += t.amount;
    });
    return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Premium Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-950/40 text-white">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-300/80">Total Net Worth</span>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">IDR • Indonesia</div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black mb-8 tracking-tight">{formatCurrency(balance)}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 backdrop-blur-sm p-4 rounded-3xl border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-emerald-500 rounded-full text-white">
                  <ArrowUpRight size={10} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Pemasukan</span>
              </div>
              <p className="font-bold text-lg">{formatCurrency(summary.income)}</p>
            </div>

            <div className="bg-red-500/10 backdrop-blur-sm p-4 rounded-3xl border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-red-500 rounded-full text-white">
                  <ArrowDownLeft size={10} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-400">Pengeluaran</span>
              </div>
              <p className="font-bold text-lg">{formatCurrency(summary.expense)}</p>
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
            <div key={cat.name} className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
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
    </div>
  );
};

export default Dashboard;
