import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  Ship, 
  Container, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';

export const ReportsView: React.FC = () => {
  const { containers, vessels, transactions } = useTerminalData();

  const [reportType, setReportType] = useState<'throughput' | 'vessels' | 'dwell' | 'gate'>('throughput');
  const [shippingLineFilter, setShippingLineFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // Shipping Line unique list
  const shippingLines = Array.from(new Set(containers.map((c) => c.shippingLine)));

  // Filtered containers for report
  const filteredContainers = containers.filter((c) => {
    if (shippingLineFilter === 'all') return true;
    return c.shippingLine === shippingLineFilter;
  });

  // Export to CSV helper
  const handleExportCSV = () => {
    let csvContent = '';
    let filename = `laporan_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'throughput' || reportType === 'dwell') {
      const headers = ['No Kontainer', 'Ukuran', 'Tipe', 'Status', 'Pelayaran', 'Kapal', 'Lokasi Yard', 'Berat Kotor (kg)', 'Dwell Time (Hari)', 'Bea Cukai'];
      const rows = filteredContainers.map((c) => [
        c.containerNo,
        c.size,
        c.type,
        c.status,
        `"${c.shippingLine}"`,
        `"${c.vesselName || '-'}"`,
        c.yardLocation,
        c.grossWeight,
        c.dwellTimeDays,
        c.customsStatus
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (reportType === 'vessels') {
      const headers = ['Nama Kapal', 'Agen Pelayaran', 'Dermaga', 'Status', 'ETA', 'ETD', 'Target Bongkar', 'Selesai Bongkar', 'Target Muat', 'Selesai Muat', 'GMPH'];
      const rows = vessels.map((v) => [
        `"${v.vesselName}"`,
        `"${v.shippingAgent}"`,
        `"${v.berthSlot}"`,
        v.status,
        v.eta,
        v.etd,
        v.totalDischarge,
        v.completedDischarge,
        v.totalLoading,
        v.completedLoading,
        v.productivityGMPH
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const headers = ['No Transaksi', 'Waktu', 'Tipe', 'No Kontainer', 'Plat Truk', 'Pengemudi', 'Alat', 'Asal', 'Tujuan', 'Petugas'];
      const rows = transactions.map((t) => [
        t.transactionId,
        t.timestamp,
        t.transactionType,
        t.containerNo,
        t.truckPlate || '-',
        `"${t.driverName || '-'}"`,
        `"${t.equipmentId || '-'}"`,
        `"${t.sourceLocation || '-'}"`,
        `"${t.targetLocation || '-'}"`,
        `"${t.operatorName}"`
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Metrics summary
  const totalReportTEUs = filteredContainers.reduce((acc, c) => acc + (c.size === '40ft' || c.size === '45ft' ? 2 : 1), 0);
  const avgDwell = filteredContainers.length > 0 
    ? (filteredContainers.reduce((acc, c) => acc + (c.dwellTimeDays || 0), 0) / filteredContainers.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Laporan Operasional & Analitik Pelabuhan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Unduh laporan berkala performa throughput peti kemas, produktivitas kapal dermaga, dan audit dwell time lapangan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Report Controls & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setReportType('throughput')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'throughput' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Arus Peti Kemas (Throughput)</span>
          </button>

          <button
            onClick={() => setReportType('vessels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'vessels' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Kinerja & Sandar Kapal</span>
          </button>

          <button
            onClick={() => setReportType('dwell')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'dwell' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Dwell Time & Okupansi Yard</span>
          </button>

          <button
            onClick={() => setReportType('gate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'gate' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Log Gate In & Gate Out</span>
          </button>
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Periode Waktu:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="today">Hari Ini</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="mtd">Bulan Berjalan (MTD)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Shipping Line:</span>
            <select
              value={shippingLineFilter}
              onChange={(e) => setShippingLineFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Semua Perusahaan Pelayaran</option>
              {shippingLines.map((line) => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Section */}
      <div id="printable-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Header of Report for Print */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-4 gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              LAPORAN RESMI OPERASIONAL TPK-01
            </span>
            <h2 className="text-lg font-black text-white mt-0.5">
              {reportType === 'throughput' && 'Laporan Arus Peti Kemas (Throughput Volume)'}
              {reportType === 'vessels' && 'Laporan Produktivitas Sandar Kapal & Stevedoring'}
              {reportType === 'dwell' && 'Laporan Dwell Time & Utilisasi Lapangan Penumpukan'}
              {reportType === 'gate' && 'Laporan Arus Truk Gate In & Gate Out'}
            </h2>
            <p className="text-xs text-slate-400">
              Pelabuhan Nusantara Tanjung Priok • Periode: {dateRange} • Dicetak: {new Date().toLocaleString('id-ID')}
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              DATA TERVERIFIKASI
            </span>
          </div>
        </div>

        {/* Summary Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Total Kontainer Terdata</span>
            <span className="text-lg font-black text-white mt-0.5 block">{filteredContainers.length} Box</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Total Volume TEU</span>
            <span className="text-lg font-black text-cyan-400 mt-0.5 block">{totalReportTEUs} TEUs</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Rata-rata Dwell Time</span>
            <span className="text-lg font-black text-purple-400 mt-0.5 block">{avgDwell} Hari</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Total Kapal Sandar</span>
            <span className="text-lg font-black text-blue-400 mt-0.5 block">{vessels.length} Armada</span>
          </div>
        </div>

        {/* Dynamic Report Table */}
        <div className="overflow-x-auto">
          {reportType === 'throughput' || reportType === 'dwell' ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">No. Peti Kemas</th>
                  <th className="py-2.5 px-3">Pelayaran</th>
                  <th className="py-2.5 px-3">Ukuran & Tipe</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Lokasi Yard</th>
                  <th className="py-2.5 px-3">Berat (kg)</th>
                  <th className="py-2.5 px-3">Dwell Time</th>
                  <th className="py-2.5 px-3">Bea Cukai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContainers.map((c) => (
                  <tr key={c.containerNo} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{c.containerNo}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{c.shippingLine}</td>
                    <td className="py-2.5 px-3 text-white">{c.size} {c.type}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">{c.yardLocation}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.grossWeight.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.dwellTimeDays} hari</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.customsStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'vessels' ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Nama Kapal</th>
                  <th className="py-2.5 px-3">Agen</th>
                  <th className="py-2.5 px-3">Dermaga</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">ETA & ETD</th>
                  <th className="py-2.5 px-3">Realisasi Bongkar</th>
                  <th className="py-2.5 px-3">Realisasi Muat</th>
                  <th className="py-2.5 px-3">Produktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vessels.map((v) => (
                  <tr key={v.vesselName} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{v.vesselName}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{v.shippingAgent}</td>
                    <td className="py-2.5 px-3 text-white">{v.berthSlot}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold">
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(v.eta).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(v.etd).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{v.completedDischarge} / {v.totalDischarge} Box</td>
                    <td className="py-2.5 px-3 text-slate-300">{v.completedLoading} / {v.totalLoading} Box</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{v.productivityGMPH} GMPH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">No. Transaksi</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Operasi</th>
                  <th className="py-2.5 px-3">No. Kontainer</th>
                  <th className="py-2.5 px-3">Plat Truk</th>
                  <th className="py-2.5 px-3">Pengemudi</th>
                  <th className="py-2.5 px-3">Alat</th>
                  <th className="py-2.5 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((t) => (
                  <tr key={t.transactionId} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{t.transactionId}</td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(t.timestamp).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 font-sans">{t.transactionType}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{t.containerNo}</td>
                    <td className="py-2.5 px-3 text-slate-300">{t.truckPlate || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{t.driverName || '-'}</td>
                    <td className="py-2.5 px-3 text-cyan-300">{t.equipmentId || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{t.operatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
