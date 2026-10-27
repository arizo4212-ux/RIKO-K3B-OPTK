import React, { useState } from 'react';
import { 
  Grid, 
  Container, 
  Layers, 
  Thermometer, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  Repeat, 
  CheckCircle2,
  Box,
  Truck
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';
import { useAuth } from '../../context/AuthContext';
import { ContainerItem } from '../../types';

export const YardView: React.FC = () => {
  const { containers, updateContainer, addTransaction } = useTerminalData();
  const { profile, canEdit } = useAuth();

  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [newSlotTarget, setNewSlotTarget] = useState('BLK-A-05-02-1');

  // Filter containers belonging to selected block
  const blockContainers = containers.filter((c) => 
    c.yardLocation && c.yardLocation.toUpperCase().startsWith(`BLK-${selectedBlock}`)
  );

  const blockInfo = {
    A: { name: 'Blok A - Dry 40ft High Cube', cap: 500, type: 'Dry 40ft', color: 'border-cyan-500/40 text-cyan-400' },
    B: { name: 'Blok B - Dry 20ft Standard', cap: 500, type: 'Dry 20ft', color: 'border-blue-500/40 text-blue-400' },
    C: { name: 'Blok C - Reefer Yard (Pendingin)', cap: 200, type: 'Reefer', color: 'border-emerald-500/40 text-emerald-400' },
    D: { name: 'Blok D - Hazardous DG (Muatan Berbahaya)', cap: 100, type: 'Dangerous Goods', color: 'border-amber-500/40 text-amber-400' }
  };

  // Generate a 4x4 visual bay grid representation
  const bays = [1, 2, 3, 4];
  const rows = [1, 2, 3, 4];

  const getContainerAtSlot = (bay: number, row: number) => {
    const formatted = `BLK-${selectedBlock}-0${bay}-0${row}`;
    return containers.find((c) => c.yardLocation && c.yardLocation.toUpperCase().startsWith(formatted));
  };

  const handleShiftContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContainer || !selectedContainer.id || !newSlotTarget.trim()) return;

    await addTransaction({
      transactionId: `TRX-YS-${Date.now().toString().slice(-6)}`,
      transactionType: 'Yard-Shift',
      containerNo: selectedContainer.containerNo,
      sourceLocation: selectedContainer.yardLocation,
      targetLocation: newSlotTarget.toUpperCase().trim(),
      equipmentId: 'RTG-01',
      operatorName: profile?.displayName || 'Yard Operator',
      notes: `Relokasi slot yard oleh operator lapangan`,
      timestamp: new Date().toISOString()
    });

    setSelectedContainer(null);
    setIsShiftModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Monitoring Lapangan Penumpukan (Yard Interactive 2D)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visualisasi penempatan bay, row, dan tier peti kemas pada masing-masing blok lapangan terminal.
          </p>
        </div>

        {/* Block Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {(['A', 'B', 'C', 'D'] as const).map((blk) => (
            <button
              key={blk}
              onClick={() => {
                setSelectedBlock(blk);
                setSelectedContainer(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedBlock === blk
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Blok {blk}
            </button>
          ))}
        </div>
      </div>

      {/* Block Information Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              ZONA LAPANGAN AKTIF
            </span>
            {selectedBlock === 'C' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <Thermometer className="w-3 h-3" /> Reefer Power Supply On
              </span>
            )}
            {selectedBlock === 'D' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                <AlertTriangle className="w-3 h-3" /> Area Bahan Berbahaya (B3)
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {blockInfo[selectedBlock].name}
          </h2>
          <p className="text-xs text-slate-400">
            Kapasitas: {blockContainers.length} / {blockInfo[selectedBlock].cap} TEU terisi ({Math.round((blockContainers.length / blockInfo[selectedBlock].cap) * 100)}% Okupansi)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500" />
            <span>Terisi (In-Yard)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Hold / DG</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Reefer Plugged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-dashed border-slate-700 bg-slate-950/40" />
            <span>Slot Kosong</span>
          </div>
        </div>
      </div>

      {/* Interactive Yard Grid & Container Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="font-mono">TATA LETAK LAPANGAN (BAY 01 - 04, ROW 01 - 04)</span>
            <span>Klik slot untuk memeriksa data kontainer</span>
          </div>

          <div className="space-y-4">
            {bays.map((bay) => (
              <div key={bay} className="space-y-1.5">
                <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                  Bay 0{bay} (Blok {selectedBlock})
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rows.map((row) => {
                    const cont = getContainerAtSlot(bay, row);
                    const slotCode = `BLK-${selectedBlock}-0${bay}-0${row}`;
                    const isSelected = selectedContainer?.yardLocation === cont?.yardLocation && cont !== undefined;

                    return (
                      <div
                        key={row}
                        onClick={() => cont && setSelectedContainer(cont)}
                        className={`p-3 rounded-xl border transition cursor-pointer relative ${
                          cont
                            ? isSelected
                              ? 'bg-cyan-950 border-cyan-400 shadow-md ring-2 ring-cyan-500/50'
                              : cont.type === 'Reefer'
                              ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400'
                              : cont.customsStatus === 'Red Channel' || cont.type === 'Dangerous Goods (DG)'
                              ? 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400'
                              : 'bg-slate-950/70 border-cyan-500/30 hover:border-cyan-400'
                            : 'bg-slate-950/20 border-slate-800/80 border-dashed hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-slate-400 font-bold">R-0{row}</span>
                          <span className="text-slate-400">{slotCode}</span>
                        </div>

                        {cont ? (
                          <div className="space-y-0.5">
                            <div className="font-mono font-bold text-white text-xs truncate">
                              {cont.containerNo}
                            </div>
                            <div className="text-[10px] text-cyan-300 font-sans truncate">
                              {cont.shippingLine}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cont.size} • {(cont.grossWeight / 1000).toFixed(1)}T
                            </div>
                          </div>
                        ) : (
                          <div className="h-10 flex items-center justify-center text-[11px] text-slate-600 font-mono">
                            [ KOSONG ]
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Slot Detail Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Box className="w-5 h-5 text-cyan-400" />
            <span>Detail Peti Kemas Lapangan</span>
          </div>

          {selectedContainer ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {selectedContainer.yardLocation}
                    </span>
                    <h3 className="text-lg font-black text-white font-mono mt-1">
                      {selectedContainer.containerNo}
                    </h3>
                    <p className="text-slate-400">{selectedContainer.shippingLine}</p>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px] font-bold border border-blue-800">
                    {selectedContainer.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-slate-300 border-t border-slate-800/80 pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipe & Ukuran:</span>
                    <span className="text-white">{selectedContainer.size} {selectedContainer.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Berat Kotor:</span>
                    <span className="text-white">{selectedContainer.grossWeight.toLocaleString('id-ID')} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Segel:</span>
                    <span className="text-white">{selectedContainer.sealNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kapal (Vessel):</span>
                    <span className="text-white">{selectedContainer.vesselName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dwell Time:</span>
                    <span className={selectedContainer.dwellTimeDays > 3 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {selectedContainer.dwellTimeDays} Hari
                    </span>
                  </div>
                  {selectedContainer.temperature && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suhu Reefer:</span>
                      <span className="text-cyan-400 font-bold">{selectedContainer.temperature}</span>
                    </div>
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setNewSlotTarget(`BLK-${selectedBlock}-04-01-2`);
                      setIsShiftModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Relokasi / Pindah Slot (Yard-Shift)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-700" />
              <p className="font-semibold text-slate-400">Pilih salah satu slot di lapangan</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Klik kotak kontainer pada peta di sebelah kiri untuk melihat rincian muatan dan relokasi penumpukan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* YARD SHIFT MODAL */}
      {isShiftModalOpen && selectedContainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-cyan-400" />
              <span>Relokasi Peti Kemas: {selectedContainer.containerNo}</span>
            </h3>

            <form onSubmit={handleShiftContainer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Lokasi Saat Ini:</label>
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono">
                  {selectedContainer.yardLocation}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pindah ke Slot Baru (Blok-Bay-Row-Tier) *
                </label>
                <input
                  type="text"
                  required
                  value={newSlotTarget}
                  onChange={(e) => setNewSlotTarget(e.target.value.toUpperCase())}
                  placeholder="BLK-A-03-04-2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow"
                >
                  Konfirmasi Pemindahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
