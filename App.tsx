
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Pinjaman from './components/Pinjaman';
import LoginPage from './pages/LoginPage';
import { Transaction, User } from './types';
import { Plus } from 'lucide-react';

import { getTransactions, createTransaction, removeTransaction } from './utils/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ email: '', isAuthenticated: false });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'pinjaman'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await getTransactions();
      setTransactions(data);
      if (error) setIsSupabaseConnected(false);
      else setIsSupabaseConnected(true);
    };
    fetchData();

    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser({ email: savedUser, isAuthenticated: true });
    }
  }, []);

  const handleLogin = (email: string) => {
    setUser({ email, isAuthenticated: true });
    localStorage.setItem('user_session', email);
  };

  const handleLogout = () => {
    setUser({ email: '', isAuthenticated: false });
    localStorage.removeItem('user_session');
  };

  const addTransaction = async (t: Transaction) => {
    // Optimistic update
    const optimisticId = t.id;
    setTransactions(prev => [t, ...prev]);

    try {
      const savedData = await createTransaction(t);
      if (savedData) {
        setTransactions(prev => prev.map(item =>
          item.id === optimisticId ? { ...item, id: savedData.id.toString() } : item
        ));
      }
    } catch (error: any) {
      console.error("Failed to save transaction to Supabase", error);
      // Revert optimistic update
      setTransactions(prev => prev.filter(item => item.id !== optimisticId));

      if (error.code === '42501') {
        alert("Eits! Database terkunci. 🔒\n\nUntuk mengatasinya:\n1. Buka Supabase Dashboard > SQL Editor\n2. Jalankan perintah SQL yang ada di file FIX_DATABASE_ACCESS.md\n\nError: " + error.message);
      } else {
        alert("Gagal menyimpan transaksi. Cek koneksi internet Anda.");
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    // Optimistic update
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);

    try {
      await removeTransaction(id);
    } catch (error) {
      console.error("Failed to delete transaction from Supabase", error);
    }
  };

  if (!user.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="max-w-6xl mx-auto pb-10">
        {activeTab === 'dashboard' && (
          <>
            <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                  Halo, {user.email.split('@')[0]} 👋
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">Your Financial Ecosystem</p>
              </div>
            </header>
            <Dashboard transactions={transactions} />
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <TransactionForm onAdd={addTransaction} isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
              isConnected={isSupabaseConnected}
              onAddTransaction={() => setIsFormOpen(true)}
            />
          </div>
        )}

        {activeTab === 'pinjaman' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Pinjaman />
          </div>
        )}

      </div>

      {/* Mobile Floating Action Button (Only on Dashboard for quick entry) */}
      {activeTab === 'dashboard' && (
        <button
          onClick={() => setActiveTab('transactions')}
          className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/40 flex items-center justify-center z-50 active:scale-90 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}
    </Layout>
  );
};

export default App;
