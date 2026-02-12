import React, { useMemo } from 'react';
import { Transaction, MainCategory } from '../types';
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, X, CreditCard } from 'lucide-react';

interface CategoryTransactionsProps {
  transactions: Transaction[];
  categoryName: string;
  onClose?: () => void;
  showAsModal?: boolean;
}

const CategoryTransactions: React.FC<CategoryTransactionsProps> = ({ 
  transactions, 
  categoryName, 
  onClose,
  showAsModal = false 
}) => {
  const categoryTransactions = useMemo(() => {
    return transactions
      .filter(t => t.mainCategory === categoryName)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, categoryName]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case MainCategory.MORTGAGE: return <div className="p-2 bg-blue-50 rounded-xl"><span className="text-blue-500">🏠</span></div>;
      case MainCategory.DAILY: return <div className="p-2 bg-orange-50 rounded-xl"><span className="text-orange-500">🛒</span></div>;
      case MainCategory.EMERGENCY: return <div className="p-2 bg-red-50 rounded-xl"><span className="text-red-500">🚨</span></div>;
      case MainCategory.INVESTMENT: return <div className="p-2 bg-emerald-50 rounded-xl"><span className="text-emerald-500">💰</span></div>;
      case MainCategory.SOCIAL: return <div className="p-2 bg-pink-50 rounded-xl"><span className="text-pink-500">❤️</span></div>;
      case MainCategory.LOAN: return <div className="p-2 bg-amber-50 rounded-xl"><CreditCard size={20} className="text-amber-500" /></div>;
      default: return <div className="p-2 bg-slate-50 rounded-xl"><span className="text-slate-500">📊</span></div>;
    }
  };

  const totalAmount = categoryTransactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);

  const totalIncome = categoryTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = categoryTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getCategoryIcon(categoryName)}
          <div>
            <h2 className="text-xl font-black text-slate-800">{categoryName}</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {categoryTransactions.length} Transaksi
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-slate-500 rounded-full text-white">
              <TrendingUp size={10} strokeWidth={3} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">Total Net</span>
          </div>
          <p className="font-bold text-lg text-slate-800">{formatCurrency(Math.abs(totalAmount))}</p>
        </div>

        {/* <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-emerald-500 rounded-full text-white">
              <ArrowUpRight size={10} strokeWidth={3} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Pemasukan</span>
          </div>
          <p className="font-bold text-lg text-emerald-700">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-red-500 rounded-full text-white">
              <ArrowDownLeft size={10} strokeWidth={3} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-red-600">Pengeluaran</span>
          </div>
          <p className="font-bold text-lg text-red-700">{formatCurrency(totalExpense)}</p>
        </div> */}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {categoryTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-300 font-bold">
            Tidak ada transaksi untuk kategori ini
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {categoryTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-4 hover:bg-slate-50/80 transition-colors ${
                  transaction.type === 'expense' ? 'border-l-4 border-red-200' : 'border-l-4 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      {transaction.subCategory && transaction.subCategory !== 'None' && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {transaction.subCategory}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">
                      {transaction.description || 'Tanpa Keterangan'}
                    </h3>
                    {transaction.notes && (
                      <p className="text-xs text-slate-500 italic">{transaction.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      {content}
    </div>
  );
};

export default CategoryTransactions;
