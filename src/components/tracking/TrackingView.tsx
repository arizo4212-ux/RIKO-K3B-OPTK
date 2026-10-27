import React, { useState } from 'react';
import { 
  Search, 
  Container, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Ship, 
  Thermometer, 
  Layers, 
  ArrowRight,
  History
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';
import { useAuth } from '../../context/AuthContext';
import { ContainerItem, TrackingEvent } from '../../types';

export const TrackingView: React.FC = () => {
  const { containers, getTrackingForContainer, addTrackingEvent } = useTerminalData();
  const { profile, canEdit } = useAuth();

  const [searchContainerNo, setSearchContainerNo] = useState(
    containers.length > 0 ? containers[0].containerNo : 'MSKU-9821421'
  );
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event: 'Pemeriksaan Lapangan Rutin',
    stage: 'Yard',
    location: 'BLK-A-04-02-3',
    details: 'Pengecekan fisik segel dan kelayakan peti kemas',
  });

  const selectedContainer = containers.find(
    (c) => c.containerNo.trim().toUpperCase() === searchContainerNo.trim().toUpperCase()
  );

  const trackingList = getTrackingForContainer(searchContainerNo);

  const handleAddTrackingEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchContainerNo.trim()) return;

    await addTrackingEvent({
      containerNo: searchContainerNo.trim().toUpperCase(),
      event: newEvent.event,
      stage: newEvent.stage,
      location: newEvent.location,
      operator: profile?.displayName || 'Petugas Terminal',
      details: newEvent.details,
      timestamp: new Date().toISOString()
    });

    setIsAddEventOpen(false);
    setNewEvent({
      event: 'Pemeriksaan Lapangan Rutin',
      stage: 'Yard',
      location: selectedContainer?.yardLocation || 'Yard',
      details: ''
    });
  };

  // Milestone Stages Definition
  const milestones = [
    { key: 'Gate-In', label: 'Gate-In (Pintu Masuk)', desc: 'Penerimaan & Surat Jalan' },
    { key: 'In-Yard', label: 'Penumpukan Lapangan', desc: 'Yard Stacking RTG' },
    { key: 'Customs', label: 'Bea Cukai / SPPB', desc: 'Jalur Hijau / Karantina' },
    { key: 'Quay', label: 'Transfer Dermaga', desc: 'Quay Crane Standby' },
    { key: 'Vessel-Loaded', label: 'Muat di Kapal / Berlayar', desc: 'On-Board Bay Vessel' }
  ];

  const getMilestoneActiveState = (index: number) => {
    if (!selectedContainer) return false;
    const st = selectedContainer.status;
    if (st === 'Gate-In' && index <= 0) return true;
    if (st === 'In-Yard' && index <= 1) return true;
    if (st === 'Vessel-Discharged' && index <= 2) return true;
    if (st === 'Vessel-Loaded' && index <= 4) return true;
    if (st === 'Gate-Out' && index <= 1) return true;
    return index === 0;
  };

  return (
    <div className="space-y-6">
      {/* Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Pelacakan Peti Kemas & Histori Lengkap (Container Track & Trace)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Lacak posisi real-time, riwayat pergerakan dari Gate hingga kapal, dan status dwell time peti kemas.
          </p>
        </div>
      </div>

      {/* Container Search Box */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Masukkan Nomor Peti Kemas (Container No):
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={searchContainerNo}
              onChange={(e) => setSearchContainerNo(e.target.value.toUpperCase())}
              placeholder="Contoh: MSKU-9821421 / TCLU-4109823 / ONEU-7821903"
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-base font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Peti Kemas Cepat:</span>
            {containers.slice(0, 4).map((c) => (
              <button
                key={c.containerNo}
                onClick={() => setSearchContainerNo(c.containerNo)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                  searchContainerNo === c.containerNo
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {c.containerNo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedContainer ? (
        <div className="space-y-6">
          {/* Container Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Container className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-wide">
                      {selectedContainer.containerNo}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      ISO {selectedContainer.isoCode}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    {selectedContainer.shippingLine} • {selectedContainer.size} {selectedContainer.type} ({selectedContainer.category})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  selectedContainer.status === 'In-Yard'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : selectedContainer.status === 'Gate-In'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : selectedContainer.status === 'Vessel-Loaded'
                    ? 'bg-purple-950 text-purple-400 border border-purple-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  Status: {selectedContainer.status}
                </span>

                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  selectedContainer.customsStatus === 'Cleared'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : selectedContainer.customsStatus === 'Red Channel'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  Bea Cukai: {selectedContainer.customsStatus}
                </span>

                {canEdit && (
                  <button
                    onClick={() => {
                      setNewEvent((prev) => ({ ...prev, location: selectedContainer.yardLocation }));
                      setIsAddEventOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Update Status Log</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics of the Container */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400 block text-[11px] font-sans">Posisi Slot Lapangan</span>
                <span className="text-cyan-400 font-bold text-sm sm:text-base mt-0.5 block">
                  {selectedContainer.yardLocation || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400 block text-[11px] font-sans">Berat Kotor (Gross)</span>
                <span className="text-white font-bold text-sm sm:text-base mt-0.5 block">
                  {selectedContainer.grossWeight.toLocaleString('id-ID')} kg
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400 block text-[11px] font-sans">Nomor Segel (Seal)</span>
                <span className="text-white font-bold text-sm sm:text-base mt-0.5 block">
                  {selectedContainer.sealNo || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400 block text-[11px] font-sans">Dwell Time di Port</span>
                <span className={`font-bold text-sm sm:text-base mt-0.5 block ${
                  selectedContainer.dwellTimeDays > 3 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {selectedContainer.dwellTimeDays} Hari ({selectedContainer.dwellTimeDays > 3 ? 'Warning Demurrage' : 'Free Time Aman'})
                </span>
              </div>
            </div>

            {/* Visual Milestones */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Tahapan Perjalanan Peti Kemas (Operational Milestones)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {milestones.map((m, idx) => {
                  const isActive = getMilestoneActiveState(idx);
                  return (
                    <div
                      key={m.key}
                      className={`p-3 rounded-xl border transition ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                          : 'bg-slate-950/30 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold truncate">{m.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{m.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chronological Tracking Event History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Audit Trail & Riwayat Lengkap Pergerakan Peti Kemas
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {trackingList.length} Catatan Kejadian
              </span>
            </div>

            {trackingList.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                Belum ada rekaman riwayat untuk kontainer ini.
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {trackingList.map((event, idx) => (
                  <div key={event.id || idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-4 border-slate-900 shadow" />

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 hover:border-slate-700 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-bold text-white text-sm">
                          {event.event}
                        </h4>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {new Date(event.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {event.details || 'Aktivitas terverifikasi sistem terminal.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          Lokasi: {event.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          Operator: {event.operator}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 text-[10px] font-sans">
                          Tahap: {event.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Container className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nomor Peti Kemas Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Pastikan nomor peti kemas sudah didaftarkan di Master Data atau lakukan Gate-In terlebih dahulu.
          </p>
        </div>
      )}

      {/* MODAL TAMBAH EVENT TRACKING */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>Tambah Catatan Histori: {searchContainerNo}</span>
            </h3>

            <form onSubmit={handleAddTrackingEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Kejadian (Event)</label>
                <input
                  type="text"
                  required
                  value={newEvent.event}
                  onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
                  placeholder="Contoh: Inspeksi Karantina Selesai"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tahap Operasional</label>
                <select
                  value={newEvent.stage}
                  onChange={(e) => setNewEvent({ ...newEvent, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Gate In">Gate In</option>
                  <option value="Yard">Yard (Lapangan Penumpukan)</option>
                  <option value="Customs">Bea Cukai / Karantina</option>
                  <option value="Quay">Dermaga / Crane</option>
                  <option value="Vessel">Di Atas Kapal (On-Board)</option>
                  <option value="Gate Out">Gate Out</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Lokasi Detail</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="BLK-A-04-02-3 atau Gate 01"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rincian Kejadian</label>
                <textarea
                  rows={3}
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                  placeholder="Catatan kondisi kontainer, pemeriksaan segel, dll"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold shadow-md hover:bg-cyan-400"
                >
                  Simpan Catatan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
