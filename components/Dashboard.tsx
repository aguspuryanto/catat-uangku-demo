
import React, { useMemo } from 'react';
import { Transaction, MainCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon } from 'lucide-react';
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

  const monthlyHistory = useMemo(() => {
    const data: Record<string, { month: string, income: number, expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
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

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.income)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.expense)}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500 text-white rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Saat Ini</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Expense Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Komposisi Pengeluaran</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada data pengeluaran</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Monthly History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Riwayat Bulanan</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
            {monthlyHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHistory}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill={COLORS.income} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada riwayat transaksi</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
