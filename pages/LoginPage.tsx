
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl text-white mb-6 shadow-2xl shadow-indigo-200">
            <Wallet size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-3">UangKita</h1>
          <p className="text-slate-600 font-medium">Atur keuanganmu dengan cerdas & mudah</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Masuk ke Akun</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Alamat Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="nama@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Kata Sandi</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-200/50 mt-6 text-lg"
            >
              Masuk Sekarang
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium mb-2">Demo Account:</p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-sm text-slate-700 font-mono font-medium">admin@example.com</p>
              <p className="text-sm text-slate-700 font-mono font-medium">password123</p>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          &copy; 2024 UangKita Finance Tracker. Data disimpan secara aman di Supabase Cloud.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
