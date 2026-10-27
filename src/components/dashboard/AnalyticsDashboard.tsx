import React from 'react';
import { 
  Ship, 
  Container, 
  Truck, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickGateIn: () => void;
}

export const AnalyticsDashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQuickGateIn }) => {
  const { containers, vessels, transactions, equipment, isSyncing } = useTerminalData();

  // Metrics Calculations
  const totalContainers = containers.length;
  const inYardContainers = containers.filter((c) => c.status === 'In-Yard' || c.status === 'Vessel-Discharged').length;
  const totalTEUs = containers.reduce((acc, c) => acc + (c.size === '40ft' || c.size === '45ft' ? 2 : 1), 0);
  
  const customsHoldCount = containers.filter((c) => c.customsStatus === 'Hold' || c.customsStatus === 'Red Channel').length;
  const avgDwellTime = containers.length > 0 
    ? (containers.reduce((acc, c) => acc + (c.dwellTimeDays || 0), 0) / containers.length).toFixed(1)
    : '0';

  const gateInCount = transactions.filter((t) => t.transactionType === 'Gate-In').length;
  const gateOutCount = transactions.filter((t) => t.transactionType === 'Gate-Out').length;

  const activeVessels = vessels.filter((v) => v.status === 'Operations' || v.status === 'Berthing');
  const activeCranes = equipment.filter((e) => e.category === 'Quay Crane (QC)' && e.status === 'Active');

  // Average GMPH of operational vessels
  const avgGMPH = vessels.filter(v => v.productivityGMPH > 0).length > 0
    ? (vessels.reduce((acc, v) => acc + (v.productivityGMPH || 0), 0) / vessels.filter(v => v.productivityGMPH > 0).length).toFixed(1)
    : '29.5';

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800 text-cyan-300">
                TERMINAL UTAMA JAKARTA
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Dermaga 01 - 04 • 24/7 Realtime
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pusat Komando Operasional Terminal Peti Kemas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Pemantauan performa sandar kapal, ritme bongkar muat quay crane, okupansi lapangan penumpukan (yard), dan kelancaran gate terminal secara instan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenQuickGateIn}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition"
            >
              <Truck className="w-4 h-4" />
              <span>Gate-In Cepat</span>
            </button>
            <button
              onClick={() => onNavigate('transactions')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Input Bongkar/Muat</span>
            </button>
            <button
              onClick={() => onNavigate('tracking')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition"
            >
              <span>Pelacakan Kontainer</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: In-Yard */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Stok Yard</span>
            <Container className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {inYardContainers} <span className="text-xs font-normal text-slate-400 font-sans">Box</span>
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">
            {totalTEUs} TEUs Terkatalog
          </div>
        </div>

        {/* KPI 2: Vessel Operations */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Kapal Beroperasi</span>
            <Ship className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {activeVessels.length} <span className="text-xs font-normal text-slate-400 font-sans">Kapal</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Okupansi Dermaga: {((activeVessels.length / 4) * 100).toFixed(0)}%
          </div>
        </div>

        {/* KPI 3: Crane Productivity */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Produktivitas QC</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {avgGMPH} <span className="text-xs font-normal text-slate-400 font-sans">GMPH</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Gross Moves / Jam
          </div>
        </div>

        {/* KPI 4: Dwell Time */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Rata Dwell Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {avgDwellTime} <span className="text-xs font-normal text-slate-400 font-sans">Hari</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Target &lt; 3.0 Hari
          </div>
        </div>

        {/* KPI 5: Gate Throughput */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Arus Gate</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {gateInCount + gateOutCount} <span className="text-xs font-normal text-slate-400 font-sans">Truk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400">+{gateInCount} In</span> / <span className="text-blue-400">-{gateOutCount} Out</span>
          </div>
        </div>

        {/* KPI 6: Customs Hold / Red Channel */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Jalur Merah / Hold</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {customsHoldCount} <span className="text-xs font-normal text-slate-400 font-sans">Box</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-1 font-mono">
            Perlu Inspeksi Fisik
          </div>
        </div>
      </div>

      {/* Main Operational Section: Vessel Berthing & Yard Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vessel Berthing Timeline & Operations */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-white text-base">
                Status Sandar & Bongkar Muat Kapal (Berth Operations)
              </h2>
            </div>
            <button
              onClick={() => onNavigate('master')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Kelola Kapal &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {vessels.map((v) => {
              const totalMoves = (v.totalDischarge || 0) + (v.totalLoading || 0);
              const completedMoves = (v.completedDischarge || 0) + (v.completedLoading || 0);
              const progressPct = totalMoves > 0 ? Math.round((completedMoves / totalMoves) * 100) : 0;

              return (
                <div
                  key={v.id || v.vesselName}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm sm:text-base">
                          {v.vesselName}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          {v.callSign} • {v.imoNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {v.shippingAgent} • <span className="text-cyan-400 font-medium">{v.berthSlot}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        v.status === 'Operations'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : v.status === 'Berthing'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : v.status === 'Approaching'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {v.status}
                      </span>
                      {v.productivityGMPH > 0 && (
                        <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 text-[11px] font-mono">
                          {v.productivityGMPH} GMPH
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar Bongkar / Muat */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300 font-mono">
                      <span>Progres Stevedoring: {progressPct}% ({completedMoves}/{totalMoves} Box)</span>
                      <span>
                        Bongkar: {v.completedDischarge}/{v.totalDischarge} | Muat: {v.completedLoading}/{v.totalLoading}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Alat: <strong className="text-slate-300">{v.cranesAssigned || 'Belum dialokasikan'}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span>ETA: {new Date(v.eta).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      <span>ETD: {new Date(v.etd).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Yard Density & Equipment Fleet */}
        <div className="space-y-6">
          {/* Yard Blocks Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-white text-base">
                  Okupansi Blok Yard
                </h2>
              </div>
              <button
                onClick={() => onNavigate('yard')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Peta 2D &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {/* Block A */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Blok A (Dry 40ft High Cube)</span>
                  <span className="font-mono text-cyan-400">78% (390/500 TEU)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Block B */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Blok B (Dry 20ft Standard)</span>
                  <span className="font-mono text-blue-400">62% (310/500 TEU)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              {/* Block C */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Blok C (Reefer Cooling Zone)</span>
                  <span className="font-mono text-emerald-400">45% (90/200 TEU)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              {/* Block D */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Blok D (Hazardous DG / Khusus)</span>
                  <span className="font-mono text-amber-400">85% (85/100 TEU)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Equipment Fleet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Armada Crane & Alat Terminal
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {equipment.length} Unit
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {equipment.slice(0, 5).map((eq) => (
                <div
                  key={eq.id || eq.code}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span>{eq.code}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">
                        ({eq.name})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Op: {eq.operator} • {eq.movesCompleted} Gerakan
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      eq.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {eq.status}
                    </span>
                    <div className="text-[10px] font-mono text-cyan-400 mt-1">
                      BBM: {eq.fuelLevel}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Streaming Activity Log (Live Transactions) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="font-bold text-white text-base">
              Live Feed Transaksi Operasional Terminal (Firestore Sync)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Lihat Semua Transaksi &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">No. Transaksi</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Tipe Operasi</th>
                <th className="py-2.5 px-3">No. Kontainer</th>
                <th className="py-2.5 px-3">Truk / Alat</th>
                <th className="py-2.5 px-3">Lokasi Asal &rarr; Tujuan</th>
                <th className="py-2.5 px-3">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transactions.slice(0, 5).map((trx) => (
                <tr key={trx.id || trx.transactionId} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">{trx.transactionId}</td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(trx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      trx.transactionType === 'Gate-In'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : trx.transactionType === 'Gate-Out'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : trx.transactionType === 'Vessel-Load'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {trx.transactionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-white font-bold">{trx.containerNo}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">
                    {trx.truckPlate || trx.equipmentId || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <span className="text-slate-400">{trx.sourceLocation || '-'}</span> &rarr; <span className="text-cyan-300 font-semibold">{trx.targetLocation || '-'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{trx.operatorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
