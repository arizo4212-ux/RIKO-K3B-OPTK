import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Flame, 
  Radio 
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useTerminalData();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.priority === 'urgent' || n.priority === 'high';
    return true;
  });

  const getIcon = (type: string, priority: string) => {
    if (priority === 'urgent' || type === 'alert') {
      return <Flame className="w-4 h-4 text-rose-400" />;
    }
    if (type === 'warning' || priority === 'high') {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    if (type === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    return <Info className="w-4 h-4 text-cyan-400" />;
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                Pemberitahuan Operasional
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400">
                Peringatan waktu-nyata dermaga, gate & yard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Clear */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/60">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter === 'unread' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Belum Dibaca ({notifications.filter((n) => !n.read).length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter === 'urgent' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Mendesak
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
              title="Bersihkan Semua"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center px-4">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">Tidak ada notifikasi aktif</p>
              <p className="text-xs text-slate-500 mt-1">Operasional terminal berjalan aman dan terkendali.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => item.id && markNotificationRead(item.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden group ${
                  item.read
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/60 border-cyan-500/30 text-white shadow-sm'
                }`}
              >
                {!item.read && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-bl-lg" />
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 flex-shrink-0 mt-0.5">
                    {getIcon(item.type, item.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-semibold truncate text-white">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed break-words">
                      {item.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        item.priority === 'urgent'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                          : item.priority === 'high'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.priority}
                      </span>

                      {!item.read && (
                        <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
                          <Check className="w-3 h-3" />
                          Tandai dibaca
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
