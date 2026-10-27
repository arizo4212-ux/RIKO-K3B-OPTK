import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Database, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  Wifi, 
  Radio, 
  SlidersHorizontal 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTerminalData } from '../../context/TerminalDataContext';

interface NavbarProps {
  onToggleNotifications: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleNotifications, onOpenSettings }) => {
  const { profile, logout, isAdmin } = useAuth();
  const { isDbConnected, isSyncing, unreadNotificationCount, reseedDatabase } = useTerminalData();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [reseedLoading, setReseedLoading] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReseed = async () => {
    if (!window.confirm('Muat ulang data sampel terminal ke database Firestore online?')) return;
    setReseedLoading(true);
    try {
      await reseedDatabase();
    } finally {
      setReseedLoading(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Admin Port</span>;
      case 'supervisor':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Yard Spv</span>;
      case 'gate_operator':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Gate Op</span>;
      case 'agent':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Agen Kapal</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">User</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                NUSANTARA PORT TOS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 border border-cyan-800 text-cyan-300">
                <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Terminal Peti Kemas Tanjung Priok (TPK-01)
            </p>
          </div>
        </div>

        {/* Live Clock & Database Sync Indicator */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '00:00:00 WIB'}</span>
          </div>

          {/* Database Live Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-[11px] text-slate-300">
                {isSyncing ? 'Sinkronisasi...' : isDbConnected ? 'Firestore Realtime' : 'Menghubungkan...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Reseed DB Button for testing/demo */}
          {isAdmin && (
            <button
              onClick={handleReseed}
              disabled={reseedLoading}
              title="Reset & Muat Data Sampel Terminal"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${reseedLoading ? 'animate-spin' : ''}`} />
              <span>Muat Sampel</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
            title="Pemberitahuan Operasional"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-bounce shadow">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">
                {profile?.displayName || 'Petugas Terminal'}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                {getRoleBadge(profile?.role)}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs flex items-center gap-1"
              title="Keluar dari Sistem"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
