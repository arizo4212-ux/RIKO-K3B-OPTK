import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  ArrowLeftRight, 
  Search, 
  Grid, 
  FileText, 
  Ship, 
  Container, 
  Wrench,
  Radio
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'master' | 'transactions' | 'tracking' | 'yard' | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Analitik',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: 'LIVE'
    },
    {
      id: 'master',
      label: 'Master Data Terminal',
      icon: <Database className="w-5 h-5" />
    },
    {
      id: 'transactions',
      label: 'Transaksi Operasional',
      icon: <ArrowLeftRight className="w-5 h-5" />
    },
    {
      id: 'yard',
      label: 'Monitoring Lapangan Yard',
      icon: <Grid className="w-5 h-5" />
    },
    {
      id: 'tracking',
      label: 'Pelacakan Kontainer',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'reports',
      label: 'Laporan & Ekspor Data',
      icon: <FileText className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 flex-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigasi Utama
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition text-left group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Terminal Port Quick Info Card */}
      <div className="p-3 m-3 bg-slate-950/80 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            Dermaga Beroperasi
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            4 Slot Aktif
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Dermaga 01:</span>
            <span className="text-white font-mono">MV Nusantara Jaya</span>
          </div>
          <div className="flex justify-between">
            <span>Dermaga 02:</span>
            <span className="text-white font-mono">KM Meratus</span>
          </div>
          <div className="flex justify-between">
            <span>Quay Crane:</span>
            <span className="text-cyan-400 font-mono">3 / 4 Aktif</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
