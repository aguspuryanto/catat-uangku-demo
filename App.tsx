
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import LoginPage from './pages/LoginPage';
import { Transaction, User } from './types';
import { saveTransactions, loadTransactions } from './storage';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ email: '', isAuthenticated: false });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const data = loadTransactions();
    setTransactions(data);
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser({ email: savedUser, isAuthenticated: true });
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions]);

  const handleLogin = (email: string) => {
    setUser({ email, isAuthenticated: true });
    localStorage.setItem('user_session', email);
  };

  const handleLogout = () => {
    setUser({ email: '', isAuthenticated: false });
    localStorage.removeItem('user_session');
  };

  const addTransaction = (t: Transaction) => {
    const updated = [t, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
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
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
              Halo, {user.email.split('@')[0]} 👋
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Your Financial Ecosystem</p>
          </div>
          
          {/* Desktop Add Button */}
          <div className="hidden sm:block">
             <TransactionForm onAdd={addTransaction} />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard transactions={transactions} />
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="sm:hidden">
              <TransactionForm onAdd={addTransaction} />
            </div>
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button (Only on Dashboard for quick entry) */}
      {activeTab === 'dashboard' && (
        <button 
          onClick={() => setActiveTab('transactions')}
          className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/50 flex items-center justify-center z-50 active:scale-90 transition-transform"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}
    </Layout>
  );
};

export default App;
