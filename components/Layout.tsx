
import React from 'react';
import { LayoutDashboard, ReceiptText, LogOut, Wallet, Calculator } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  activeTab: 'dashboard' | 'transactions' | 'pinjaman';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'pinjaman') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Wallet size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">UangKita</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ReceiptText size={20} />
            Transaksi
          </button>
          {/* Fitur Pinjaman */}
          <button 
            onClick={() => setActiveTab('pinjaman')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pinjaman' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calculator size={20} />
            Pinjaman
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-100">
            <Wallet size={18} />
          </div>
          <span className="text-lg font-bold text-slate-800">UangKita</span>
        </div>
        <button onClick={onLogout} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex justify-around items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Beranda</span>
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'transactions' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <ReceiptText size={24} strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Transaksi</span>
        </button>
        <button 
          onClick={() => setActiveTab('pinjaman')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'pinjaman' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <Calculator size={24} strokeWidth={activeTab === 'pinjaman' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pinjaman</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
