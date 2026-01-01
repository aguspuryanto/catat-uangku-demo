
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import LoginPage from './pages/LoginPage';
import { Transaction, User } from './types';
import { saveTransactions, loadTransactions } from './storage';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ email: '', isAuthenticated: false });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data on mount
  useEffect(() => {
    const data = loadTransactions();
    setTransactions(data);

    // Persist login if session was active (simplified for demo)
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser({ email: savedUser, isAuthenticated: true });
    }
  }, []);

  // Save data on change
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
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Halo, {user.email.split('@')[0]} 👋
          </h1>
          <p className="text-slate-500">Kelola rencana keuanganmu hari ini.</p>
        </header>

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <Dashboard transactions={transactions} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <TransactionForm onAdd={addTransaction} />
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
