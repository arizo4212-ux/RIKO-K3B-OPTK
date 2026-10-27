import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Truck, 
  Ship, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  FileCheck, 
  X, 
  CheckCircle2, 
  QrCode, 
  Layers 
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';
import { useAuth } from '../../context/AuthContext';
import { OperationalTransaction, TransactionType } from '../../types';

interface TransactionsViewProps {
  initialOpenGateIn?: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ initialOpenGateIn = false }) => {
  const { transactions, containers, vessels, equipment, addTransaction, deleteTransaction } = useTerminalData();
  const { profile, canEdit, isAdmin } = useAuth();

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenGateIn);
  const [selectedForPrint, setSelectedForPrint] = useState<OperationalTransaction | null>(null);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('Gate-In');
  const [formContainerNo, setFormContainerNo] = useState('');
  const [formTruckPlate, setFormTruckPlate] = useState('B 9481 PXZ');
  const [formDriverName, setFormDriverName] = useState('Ahmad Fauzi');
  const [formEquipmentId, setFormEquipmentId] = useState('RTG-01');
  const [formSourceLoc, setFormSourceLoc] = useState('Luar Terminal');
  const [formTargetLoc, setFormTargetLoc] = useState('BLK-A-03-02-1');
  const [formVesselName, setFormVesselName] = useState('MV Nusantara Jaya');
  const [formNotes, setFormNotes] = useState('Pemeriksaan fisik normal, segel terverifikasi');

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.truckPlate && t.truckPlate.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.driverName && t.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.operatorName.toLowerCase().includes(searchQuery.toLowerCase());

    if (typeFilter === 'all') return matchesSearch;
    return matchesSearch && t.transactionType === typeFilter;
  });

  const handleOpenModal = (defaultType: TransactionType = 'Gate-In') => {
    setFormType(defaultType);
    if (containers.length > 0) {
      setFormContainerNo(containers[0].containerNo);
    }
    if (defaultType === 'Gate-In') {
      setFormSourceLoc('Luar Pelabuhan (Inbound)');
      setFormTargetLoc('BLK-A-01-02-3');
    } else if (defaultType === 'Gate-Out') {
      setFormSourceLoc('BLK-A-04-02-3');
      setFormTargetLoc('Luar Pelabuhan (Delivery)');
    } else if (defaultType === 'Vessel-Discharge') {
      setFormSourceLoc('Palka Kapal (Bay 12)');
      setFormTargetLoc('BLK-B-02-01-2');
    } else if (defaultType === 'Vessel-Load') {
      setFormSourceLoc('BLK-A-03-01-2');
      setFormTargetLoc('Palka Kapal (Bay 16)');
    }
    setIsModalOpen(true);
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContainerNo.trim()) return;

    const newId = `TRX-${formType.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    await addTransaction({
      transactionId: newId,
      transactionType: formType,
      containerNo: formContainerNo.toUpperCase().trim(),
      vesselName: formVesselName,
      truckPlate: formTruckPlate,
      driverName: formDriverName,
      equipmentId: formEquipmentId,
      sourceLocation: formSourceLoc,
      targetLocation: formTargetLoc,
      operatorName: profile?.displayName || 'Petugas Terminal',
      notes: formNotes,
      timestamp: new Date().toISOString()
    });

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, trxId: string) => {
    if (!window.confirm(`Hapus transaksi ${trxId} dari log database?`)) return;
    await deleteTransaction(id);
  };

  const handlePrint = (trx: OperationalTransaction) => {
    setSelectedForPrint(trx);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Transaksi Operasional Terminal Peti Kemas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pencatatan real-time arus Gate-In, Gate-Out, Bongkar / Muat kapal dermaga, dan relokasi yard otomatis sinkron ke Firestore.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal('Gate-In')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Gate-In</span>
            </button>
            <button
              onClick={() => handleOpenModal('Gate-Out')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Gate-Out</span>
            </button>
            <button
              onClick={() => handleOpenModal('Vessel-Discharge')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Bongkar / Muat</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari ID Transaksi, No. Kontainer, Plat Truk, Supir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'Gate-In', 'Gate-Out', 'Vessel-Discharge', 'Vessel-Load', 'Yard-Shift'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === type
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'all' ? 'Semua Transaksi' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Waktu Operasional</th>
                <th className="py-3 px-4">Tipe Operasi</th>
                <th className="py-3 px-4">No. Peti Kemas</th>
                <th className="py-3 px-4">Truk / Pengemudi</th>
                <th className="py-3 px-4">Alat Berat</th>
                <th className="py-3 px-4">Rute (Asal &rarr; Tujuan)</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-right">E-Ticket / Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    Belum ada transaksi operasional yang tercatat di kategori ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id || trx.transactionId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {trx.transactionId}
                    </td>

                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {new Date(trx.timestamp).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        trx.transactionType === 'Gate-In'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : trx.transactionType === 'Gate-Out'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : trx.transactionType === 'Vessel-Load'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : trx.transactionType === 'Vessel-Discharge'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {trx.transactionType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-white tracking-wide">
                      {trx.containerNo}
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-300">
                      <div className="font-mono text-white">{trx.truckPlate || '-'}</div>
                      <div className="text-[10px] text-slate-400">{trx.driverName || '-'}</div>
                    </td>

                    <td className="py-3 px-4 text-cyan-300 font-sans">
                      {trx.equipmentId || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-slate-400">{trx.sourceLocation || '-'}</span> &rarr; <span className="text-cyan-400 font-semibold">{trx.targetLocation || '-'}</span>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-400">
                      {trx.operatorName}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => handlePrint(trx)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs transition"
                          title="Cetak Surat Jalan / Gate Pass"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Gate Pass</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => trx.id && handleDelete(trx.id, trx.transactionId)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION INPUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
                <span>Pencatatan Transaksi Operasional Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jenis Operasi Terminal *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Gate-In">Gate-In (Peti Kemas Masuk Port)</option>
                    <option value="Gate-Out">Gate-Out (Peti Kemas Keluar Port)</option>
                    <option value="Vessel-Discharge">Bongkar Kapal (Vessel Discharge)</option>
                    <option value="Vessel-Load">Muat Kapal (Vessel Load)</option>
                    <option value="Yard-Shift">Relokasi Lapangan (Yard-Shift)</option>
                    <option value="Inspection">Pemeriksaan Fisik / Timbangan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor Peti Kemas *</label>
                  <input
                    type="text"
                    required
                    list="container-options"
                    value={formContainerNo}
                    onChange={(e) => setFormContainerNo(e.target.value.toUpperCase())}
                    placeholder="MSKU-9821421"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <datalist id="container-options">
                    {containers.map((c) => (
                      <option key={c.containerNo} value={c.containerNo}>
                        {c.shippingLine} ({c.type} {c.size})
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor Plat Truk</label>
                  <input
                    type="text"
                    value={formTruckPlate}
                    onChange={(e) => setFormTruckPlate(e.target.value.toUpperCase())}
                    placeholder="B 9821 UXT"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Supir / Pengemudi</label>
                  <input
                    type="text"
                    value={formDriverName}
                    onChange={(e) => setFormDriverName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Alat Berat / Lane yang Digunakan</label>
                  <select
                    value={formEquipmentId}
                    onChange={(e) => setFormEquipmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Gate Lane 01 (Inbound)">Gate Lane 01 (Inbound)</option>
                    <option value="Gate Lane 02 (Inbound)">Gate Lane 02 (Inbound)</option>
                    <option value="Gate Lane 03 (Outbound)">Gate Lane 03 (Outbound)</option>
                    {equipment.map((eq) => (
                      <option key={eq.code} value={eq.code}>
                        {eq.code} - {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kapal Terkait</label>
                  <select
                    value={formVesselName}
                    onChange={(e) => setFormVesselName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="-">Tanpa Kapal (Domestic Trucking)</option>
                    {vessels.map((v) => (
                      <option key={v.vesselName} value={v.vesselName}>
                        {v.vesselName} ({v.berthSlot})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lokasi Asal (Source)</label>
                  <input
                    type="text"
                    value={formSourceLoc}
                    onChange={(e) => setFormSourceLoc(e.target.value)}
                    placeholder="Luar Terminal / Lapangan"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lokasi Tujuan (Target Yard/Slot)</label>
                  <input
                    type="text"
                    value={formTargetLoc}
                    onChange={(e) => setFormTargetLoc(e.target.value.toUpperCase())}
                    placeholder="BLK-A-03-02-1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Catatan Operasional / Pemeriksaan Fisik</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Kondisi segel utuh, berat sesuai manifest SPPB"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                >
                  Proses Transaksi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE GATE PASS SECTION (For Browser Print) */}
      {selectedForPrint && (
        <div id="printable-section" className="hidden print:block p-8 bg-white text-black font-sans">
          <div className="border-2 border-black p-6 rounded-lg max-w-xl mx-auto space-y-4">
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">NUSANTARA PORT TERMINAL</h1>
                <p className="text-xs">PT PELABUHAN NUSANTARA TPK-01 JAKARTA</p>
                <p className="text-xs">Terminal Operating System • Surat Jalan & Gate Pass</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono">{selectedForPrint.transactionId}</div>
                <div className="text-xs">{new Date(selectedForPrint.timestamp).toLocaleString('id-ID')}</div>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded border border-gray-300 text-center">
              <span className="text-lg font-black uppercase tracking-wider">
                BUKTI TRANSAKSI {selectedForPrint.transactionType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-600 block">NOMOR PETI KEMAS:</span>
                <span className="text-base font-black">{selectedForPrint.containerNo}</span>
              </div>
              <div>
                <span className="text-gray-600 block">NOMOR PLAT TRUK:</span>
                <span className="text-base font-bold">{selectedForPrint.truckPlate || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">PENGEMUDI / SUPIR:</span>
                <span className="font-bold">{selectedForPrint.driverName || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">LOKASI PENEMPATAN:</span>
                <span className="text-base font-black text-blue-900">{selectedForPrint.targetLocation || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">KAPAL (VESSEL):</span>
                <span>{selectedForPrint.vesselName || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">ALAT BERAT:</span>
                <span>{selectedForPrint.equipmentId || '-'}</span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-2 text-xs">
              <span className="text-gray-600 block">CATATAN PEMERIKSAAN:</span>
              <p className="font-medium">{selectedForPrint.notes || 'Normal'}</p>
            </div>

            <div className="flex justify-between items-end pt-8 border-t-2 border-black text-center text-xs">
              <div>
                <p className="mb-12">Petugas Gate Terminal,</p>
                <p className="font-bold border-t border-black pt-1">({selectedForPrint.operatorName})</p>
              </div>
              <div className="font-mono text-center">
                <div className="w-16 h-16 border border-black mx-auto flex items-center justify-center text-[8px]">
                  [ QR VALID ]
                </div>
                <span className="text-[9px]">Sistem Terverifikasi Online</span>
              </div>
              <div>
                <p className="mb-12">Pengemudi Truk,</p>
                <p className="font-bold border-t border-black pt-1">({selectedForPrint.driverName || 'Supir'})</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
