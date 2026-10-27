import React, { useState } from 'react';
import { 
  Ship, 
  Lock, 
  User, 
  ShieldCheck, 
  Container, 
  ArrowRight, 
  Sparkles, 
  Anchor, 
  CheckCircle2, 
  AlertCircle,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginModal: React.FC = () => {
  const { loginWithCredentials, loginWithGoogle, loginAsRole } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('admin@terminal.id');
  const [password, setPassword] = useState('terminal123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('superadmin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithCredentials(emailOrUser, password, selectedRole);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal login ke sistem terminal');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: UserRole, defaultEmail: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      setEmailOrUser(defaultEmail);
      setSelectedRole(role);
      await loginAsRole(role);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal login role cepat');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg('Gagal login dengan Google. Gunakan form login username/email di bawah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 border-b border-slate-700/80 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <Anchor className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                    TOS v3.8 ONLINE
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Firebase Live
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                  Nusantara Port Terminal
                </h1>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Sistem Operasional Terminal Peti Kemas (TOS) terpadu. Silakan masuk untuk mengakses operasional kapal, penumpukan yard, dan transaksi dermaga.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Autentikasi Gagal</p>
                <p className="opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Quick Demo Access Badges */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Akses Cepat Pengguna (Sekali Klik):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('superadmin', 'admin@terminal.id')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 hover:border-cyan-400 transition text-left group"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-white">Admin / Mgr</span>
                <span className="text-[10px] text-cyan-300/70">Full CRUD</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('supervisor', 'supervisor@terminal.id')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/30 hover:bg-blue-900/40 hover:border-blue-400 transition text-left group"
              >
                <Container className="w-4 h-4 text-blue-400 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-white">Yard Spv</span>
                <span className="text-[10px] text-blue-300/70">Lapangan</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('gate_operator', 'gate@terminal.id')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 hover:border-emerald-400 transition text-left group"
              >
                <Ship className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-white">Gate Op</span>
                <span className="text-[10px] text-emerald-300/70">In/Out Pass</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('agent', 'agent@terminal.id')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 hover:border-purple-400 transition text-left group"
              >
                <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-white">Agen Kapal</span>
                <span className="text-[10px] text-purple-300/70">Pelacakan</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-widest absolute">
              atau masuk dengan akun
            </span>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / Email Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="admin@terminal.id atau username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Role / Peran Akses Terminal
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                <option value="superadmin">Administrator Terminal (Full Akses CRUD & Kontrol)</option>
                <option value="supervisor">Supervisor Lapangan (Yard & Bongkar Muat)</option>
                <option value="gate_operator">Petugas Gate (In/Out & Verifikasi Fisik)</option>
                <option value="agent">Agen Pelayaran / Ekspedisi (Pelacakan & Manifest)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Memverifikasi Akun...
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard Operasional</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in */}
          <div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 transition hover:border-slate-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.7 0 3 .7 3.9 1.6l2.9-2.9C17 1.9 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.6 2.8C6.4 7.2 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.5 14.9c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.6-2.8v-5.2z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.2-6.5-5.1L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
              </svg>
              <span>Masuk dengan Google (Firebase Auth)</span>
            </button>
          </div>

          {/* Database Connectivity Status Note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Realtime Database: Firestore Online
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sinkronisasi Otomatis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
