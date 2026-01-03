
import React, { useState } from 'react';
import { User, Wallet } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@example.com' && password === 'password123') {
      onLogin(email);
    } else {
      setError('Email atau Password salah (hint: admin@example.com / password123)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl text-white mb-4 shadow-xl shadow-indigo-200">
            <Wallet size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">UangKita</h1>
          <p className="text-slate-500 mt-2">Atur keuanganmu dengan cerdas & mudah</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Masuk ke Akun</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Alamat Email</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="nama@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Kata Sandi</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4"
            >
              Masuk Sekarang
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Demo Account:</p>
            <p className="text-xs text-slate-500 font-mono mt-1">admin@example.com / password123</p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-sm">
          &copy; 2024 UangKita Finance Tracker. Data disimpan secara offline di browser Anda.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
