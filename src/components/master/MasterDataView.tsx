import React, { useState } from 'react';
import { 
  Container, 
  Ship, 
  Wrench, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  Download, 
  X, 
  Check, 
  AlertCircle,
  Thermometer,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useTerminalData } from '../../context/TerminalDataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ContainerItem, 
  VesselItem, 
  EquipmentItem, 
  ContainerSize, 
  ContainerType, 
  ContainerStatus, 
  ContainerCategory, 
  CustomsStatus,
  VesselStatus 
} from '../../types';

export const MasterDataView: React.FC = () => {
  const { 
    containers, 
    vessels, 
    equipment, 
    addContainer, 
    updateContainer, 
    deleteContainer,
    addVessel, 
    updateVessel, 
    deleteVessel,
    updateEquipment
  } = useTerminalData();
  const { canEdit, isAdmin } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'containers' | 'vessels' | 'equipment'>('containers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal states for Container
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<ContainerItem | null>(null);
  const [containerForm, setContainerForm] = useState<Omit<ContainerItem, 'id'>>({
    containerNo: '',
    isoCode: '22G1',
    size: '20ft',
    type: 'Dry',
    status: 'In-Yard',
    category: 'Import',
    sealNo: '',
    shippingLine: 'Samudera Indonesia',
    vesselName: '',
    yardLocation: 'BLK-A-01-01-1',
    grossWeight: 20000,
    tareWeight: 2300,
    netWeight: 17700,
    customsStatus: 'Cleared',
    dwellTimeDays: 0,
    temperature: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Modal states for Vessel
  const [isVesselModalOpen, setIsVesselModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<VesselItem | null>(null);
  const [vesselForm, setVesselForm] = useState<Omit<VesselItem, 'id'>>({
    vesselName: '',
    imoNumber: 'IMO-',
    callSign: '',
    shippingAgent: '',
    berthSlot: 'Dermaga 01 - Utara',
    status: 'Scheduled',
    eta: new Date().toISOString().slice(0, 16),
    etd: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16),
    totalDischarge: 200,
    completedDischarge: 0,
    totalLoading: 200,
    completedLoading: 0,
    cranesAssigned: 'Quay Crane 01',
    productivityGMPH: 0,
    createdAt: new Date().toISOString()
  });

  // Handle open Add / Edit Container
  const handleOpenContainerModal = (item?: ContainerItem) => {
    if (item) {
      setEditingContainer(item);
      setContainerForm({ ...item });
    } else {
      setEditingContainer(null);
      setContainerForm({
        containerNo: `IDU-${Math.floor(1000000 + Math.random() * 9000000)}`,
        isoCode: '45G1',
        size: '40ft',
        type: 'Dry',
        status: 'In-Yard',
        category: 'Import',
        sealNo: `SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
        shippingLine: 'Meratus Line',
        vesselName: 'MV Nusantara Jaya',
        yardLocation: 'BLK-A-02-03-2',
        grossWeight: 24500,
        tareWeight: 3800,
        netWeight: 20700,
        customsStatus: 'Cleared',
        dwellTimeDays: 1,
        temperature: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsContainerModalOpen(true);
  };

  const handleSaveContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerForm.containerNo.trim()) return;

    if (editingContainer && editingContainer.id) {
      await updateContainer(editingContainer.id, containerForm);
    } else {
      await addContainer(containerForm);
    }
    setIsContainerModalOpen(false);
  };

  const handleDeleteContainer = async (id: string, no: string) => {
    if (!window.confirm(`Yakin ingin menghapus peti kemas ${no} dari database?`)) return;
    await deleteContainer(id);
  };

  // Handle open Add / Edit Vessel
  const handleOpenVesselModal = (item?: VesselItem) => {
    if (item) {
      setEditingVessel(item);
      setVesselForm({ ...item });
    } else {
      setEditingVessel(null);
      setVesselForm({
        vesselName: '',
        imoNumber: `IMO-${Math.floor(9000000 + Math.random() * 900000)}`,
        callSign: 'PK' + Math.floor(100 + Math.random() * 900),
        shippingAgent: 'Pelayaran Nusantara',
        berthSlot: 'Dermaga 03 - Selatan',
        status: 'Scheduled',
        eta: new Date().toISOString().slice(0, 16),
        etd: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16),
        totalDischarge: 350,
        completedDischarge: 0,
        totalLoading: 280,
        completedLoading: 0,
        cranesAssigned: 'Quay Crane 02',
        productivityGMPH: 28,
        createdAt: new Date().toISOString()
      });
    }
    setIsVesselModalOpen(true);
  };

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vesselForm.vesselName.trim()) return;

    if (editingVessel && editingVessel.id) {
      await updateVessel(editingVessel.id, vesselForm);
    } else {
      await addVessel(vesselForm);
    }
    setIsVesselModalOpen(false);
  };

  const handleDeleteVessel = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus data jadwal kapal ${name}?`)) return;
    await deleteVessel(id);
  };

  // Filtered list
  const filteredContainers = containers.filter((c) => {
    const matchesSearch = c.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shippingLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.yardLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sealNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && (c.type === filterType || c.status === filterType || c.size === filterType);
  });

  const filteredVessels = vessels.filter((v) => 
    v.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.shippingAgent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.berthSlot.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Title & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Master Data Operasional Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manajemen CRUD data pokok peti kemas, jadwal kapal dermaga, dan armada peralatan terhubung ke database online.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => { setActiveSubTab('containers'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'containers' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Container className="w-4 h-4" />
            <span>Peti Kemas ({containers.length})</span>
          </button>
          <button
            onClick={() => { setActiveSubTab('vessels'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'vessels' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Kapal & Dermaga ({vessels.length})</span>
          </button>
          <button
            onClick={() => { setActiveSubTab('equipment'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'equipment' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Alat Berat ({equipment.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DATA PETI KEMAS */}
      {activeSubTab === 'containers' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari No. Kontainer, Pelayaran, Lokasi Yard, No. Segel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Semua Tipe/Status</option>
                <option value="Dry">Dry Container</option>
                <option value="Reefer">Reefer Container</option>
                <option value="Dangerous Goods (DG)">Dangerous Goods (DG)</option>
                <option value="In-Yard">Status: In-Yard</option>
                <option value="Gate-In">Status: Gate-In</option>
                <option value="Vessel-Loaded">Status: Loaded</option>
                <option value="20ft">Ukuran: 20ft</option>
                <option value="40ft">Ukuran: 40ft</option>
              </select>
            </div>

            {canEdit && (
              <button
                onClick={() => handleOpenContainerModal()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Peti Kemas Baru</span>
              </button>
            )}
          </div>

          {/* Containers Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Peti Kemas</th>
                    <th className="py-3 px-4">Tipe & Ukuran</th>
                    <th className="py-3 px-4">Status & Kategori</th>
                    <th className="py-3 px-4">Pelayaran & Kapal</th>
                    <th className="py-3 px-4">Lokasi Yard (Slot)</th>
                    <th className="py-3 px-4">Berat Kotor</th>
                    <th className="py-3 px-4">Bea Cukai</th>
                    <th className="py-3 px-4">Dwell Time</th>
                    {canEdit && <th className="py-3 px-4 text-right">Aksi CRUD</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredContainers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                        Tidak ada data peti kemas yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredContainers.map((item) => (
                      <tr key={item.id || item.containerNo} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-cyan-400 text-sm tracking-wide">
                            {item.containerNo}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            ISO: {item.isoCode} • Segel: {item.sealNo || '-'}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{item.type}</span>
                            {item.temperature && (
                              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                                {item.temperature}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.size}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'In-Yard'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : item.status === 'Gate-In'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : item.status === 'Vessel-Loaded'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : item.status === 'Vessel-Discharged'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.category}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="text-white font-medium">{item.shippingLine}</div>
                          <div className="text-[10px] text-slate-400">{item.vesselName || 'Belum di-assign'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                            {item.yardLocation}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {item.grossWeight.toLocaleString('id-ID')} kg
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.customsStatus === 'Cleared'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : item.customsStatus === 'Red Channel'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : item.customsStatus === 'Hold'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.customsStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <span className={`font-semibold ${item.dwellTimeDays > 3 ? 'text-rose-400' : 'text-slate-300'}`}>
                            {item.dwellTimeDays} hari
                          </span>
                        </td>

                        {canEdit && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 font-sans">
                              <button
                                onClick={() => handleOpenContainerModal(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
                                title="Edit Peti Kemas"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => item.id && handleDeleteContainer(item.id, item.containerNo)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                                  title="Hapus Peti Kemas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATA KAPAL & DERMAGA */}
      {activeSubTab === 'vessels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari Nama Kapal, Agen, Dermaga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {canEdit && (
              <button
                onClick={() => handleOpenVesselModal()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal Kapal</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVessels.map((v) => (
              <div
                key={v.id || v.vesselName}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {v.berthSlot}
                    </span>
                    <h3 className="text-base font-black text-white mt-1.5">
                      {v.vesselName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {v.shippingAgent} • IMO: {v.imoNumber} • Call Sign: {v.callSign}
                    </p>
                  </div>

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
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ETA (Tiba)</span>
                    <span className="text-white font-medium">{new Date(v.eta).toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ETD (Berangkat)</span>
                    <span className="text-white font-medium">{new Date(v.etd).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block text-[10px]">Bongkar (Discharge)</span>
                    <span className="text-cyan-400 font-bold">{v.completedDischarge} / {v.totalDischarge} Box</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block text-[10px]">Muat (Loading)</span>
                    <span className="text-blue-400 font-bold">{v.completedLoading} / {v.totalLoading} Box</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>Alokasi: <strong className="text-slate-200">{v.cranesAssigned}</strong></span>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => handleOpenVesselModal(v)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => v.id && handleDeleteVessel(v.id, v.vesselName)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ALAT BERAT / EQUIPMENT */}
      {activeSubTab === 'equipment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((eq) => (
              <div
                key={eq.id || eq.code}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {eq.code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {eq.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{eq.category}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    eq.status === 'Active'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : eq.status === 'Maintenance'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {eq.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Penugasan:</span>
                    <span className="text-white font-medium">{eq.assignedTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operator:</span>
                    <span className="text-white font-medium">{eq.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Gerakan:</span>
                    <span className="text-cyan-400 font-bold">{eq.movesCompleted} Gerakan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Level BBM/Daya:</span>
                    <span className="text-emerald-400 font-bold">{eq.fuelLevel}%</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => eq.id && updateEquipment(eq.id, { 
                        status: eq.status === 'Active' ? 'Idle' : 'Active' 
                      })}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-semibold transition"
                    >
                      Ubah Status ({eq.status === 'Active' ? 'Set Idle' : 'Set Active'})
                    </button>
                    <button
                      onClick={() => eq.id && updateEquipment(eq.id, { 
                        status: eq.status === 'Maintenance' ? 'Active' : 'Maintenance' 
                      })}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-400 font-semibold transition"
                    >
                      {eq.status === 'Maintenance' ? 'Selesai Servis' : 'Perawatan'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTAINER MODAL (ADD / EDIT) */}
      {isContainerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Container className="w-5 h-5 text-cyan-400" />
                <span>{editingContainer ? 'Ubah Data Peti Kemas' : 'Tambah Peti Kemas Baru'}</span>
              </h3>
              <button
                onClick={() => setIsContainerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContainer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">No. Peti Kemas *</label>
                  <input
                    type="text"
                    required
                    value={containerForm.containerNo}
                    onChange={(e) => setContainerForm({ ...containerForm, containerNo: e.target.value.toUpperCase() })}
                    placeholder="MSKU-1234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">ISO Code</label>
                  <input
                    type="text"
                    value={containerForm.isoCode}
                    onChange={(e) => setContainerForm({ ...containerForm, isoCode: e.target.value.toUpperCase() })}
                    placeholder="45G1 / 22R1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ukuran (Size)</label>
                  <select
                    value={containerForm.size}
                    onChange={(e) => setContainerForm({ ...containerForm, size: e.target.value as ContainerSize })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="20ft">20 Feet (1 TEU)</option>
                    <option value="40ft">40 Feet (2 TEU)</option>
                    <option value="45ft">45 Feet High Cube (2.25 TEU)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipe Peti Kemas</label>
                  <select
                    value={containerForm.type}
                    onChange={(e) => setContainerForm({ ...containerForm, type: e.target.value as ContainerType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Dry">Dry Standard</option>
                    <option value="Reefer">Reefer (Pendingin)</option>
                    <option value="Dangerous Goods (DG)">Dangerous Goods (DG / B3)</option>
                    <option value="Flat Rack">Flat Rack</option>
                    <option value="Open Top">Open Top</option>
                    <option value="Tank">ISO Tank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Lapangan</label>
                  <select
                    value={containerForm.status}
                    onChange={(e) => setContainerForm({ ...containerForm, status: e.target.value as ContainerStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="In-Yard">In-Yard (Di Lapangan)</option>
                    <option value="Gate-In">Gate-In (Baru Masuk)</option>
                    <option value="Vessel-Discharged">Vessel-Discharged (Baru Turun Kapal)</option>
                    <option value="Vessel-Loaded">Vessel-Loaded (Telah Dimuat ke Kapal)</option>
                    <option value="Gate-Out">Gate-Out (Keluar Terminal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={containerForm.category}
                    onChange={(e) => setContainerForm({ ...containerForm, category: e.target.value as ContainerCategory })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Import">Import</option>
                    <option value="Export">Export</option>
                    <option value="Transhipment">Transhipment</option>
                    <option value="Empty">Empty (Kosong)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Perusahaan Pelayaran (Shipping Line)</label>
                  <input
                    type="text"
                    required
                    value={containerForm.shippingLine}
                    onChange={(e) => setContainerForm({ ...containerForm, shippingLine: e.target.value })}
                    placeholder="Maersk / Samudera Indonesia / Meratus"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Kapal (Vessel)</label>
                  <input
                    type="text"
                    value={containerForm.vesselName}
                    onChange={(e) => setContainerForm({ ...containerForm, vesselName: e.target.value })}
                    placeholder="MV Nusantara Jaya"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lokasi Yard (Blok-Bay-Row-Tier)</label>
                  <input
                    type="text"
                    value={containerForm.yardLocation}
                    onChange={(e) => setContainerForm({ ...containerForm, yardLocation: e.target.value.toUpperCase() })}
                    placeholder="BLK-A-04-02-3"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor Segel (Seal No.)</label>
                  <input
                    type="text"
                    value={containerForm.sealNo}
                    onChange={(e) => setContainerForm({ ...containerForm, sealNo: e.target.value })}
                    placeholder="SEAL-99812"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Berat Kotor (Gross Weight kg)</label>
                  <input
                    type="number"
                    value={containerForm.grossWeight}
                    onChange={(e) => setContainerForm({ ...containerForm, grossWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Kepabeanan (Bea Cukai)</label>
                  <select
                    value={containerForm.customsStatus}
                    onChange={(e) => setContainerForm({ ...containerForm, customsStatus: e.target.value as CustomsStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Cleared">Cleared (SPPB / Jalur Hijau)</option>
                    <option value="Pending">Pending Pemeriksaan Dokumen</option>
                    <option value="Hold">Hold / Penahanan Bea Cukai</option>
                    <option value="Red Channel">Red Channel (Pemeriksaan Fisik)</option>
                  </select>
                </div>

                {containerForm.type === 'Reefer' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      Target Suhu Reefer (°C)
                    </label>
                    <input
                      type="text"
                      value={containerForm.temperature || ''}
                      onChange={(e) => setContainerForm({ ...containerForm, temperature: e.target.value })}
                      placeholder="-18.5°C"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContainerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                >
                  {editingContainer ? 'Simpan Perubahan' : 'Tambah ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VESSEL MODAL (ADD / EDIT) */}
      {isVesselModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                <span>{editingVessel ? 'Ubah Data Jadwal Kapal' : 'Tambah Jadwal Kapal Baru'}</span>
              </h3>
              <button
                onClick={() => setIsVesselModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVessel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Nama Kapal (Vessel Name) *</label>
                  <input
                    type="text"
                    required
                    value={vesselForm.vesselName}
                    onChange={(e) => setVesselForm({ ...vesselForm, vesselName: e.target.value })}
                    placeholder="MV Nusantara Jaya"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">IMO Number</label>
                  <input
                    type="text"
                    value={vesselForm.imoNumber}
                    onChange={(e) => setVesselForm({ ...vesselForm, imoNumber: e.target.value })}
                    placeholder="IMO-9481923"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Call Sign</label>
                  <input
                    type="text"
                    value={vesselForm.callSign}
                    onChange={(e) => setVesselForm({ ...vesselForm, callSign: e.target.value })}
                    placeholder="YDYK"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Agen Pelayaran</label>
                  <input
                    type="text"
                    value={vesselForm.shippingAgent}
                    onChange={(e) => setVesselForm({ ...vesselForm, shippingAgent: e.target.value })}
                    placeholder="Samudera Agency"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Alokasi Dermaga (Berth Slot)</label>
                  <select
                    value={vesselForm.berthSlot}
                    onChange={(e) => setVesselForm({ ...vesselForm, berthSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Dermaga 01 - Utara">Dermaga 01 - Utara (Post-Panamax)</option>
                    <option value="Dermaga 02 - Tengah">Dermaga 02 - Tengah (Domestik)</option>
                    <option value="Dermaga 03 - Selatan">Dermaga 03 - Selatan (Internasional)</option>
                    <option value="Dermaga 04 - Timur">Dermaga 04 - Timur (Feeder)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Sandar</label>
                  <select
                    value={vesselForm.status}
                    onChange={(e) => setVesselForm({ ...vesselForm, status: e.target.value as VesselStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled (Terjadwal)</option>
                    <option value="Approaching">Approaching (Mendekat)</option>
                    <option value="Berthing">Berthing (Proses Sandar)</option>
                    <option value="Operations">Operations (Bongkar Muat)</option>
                    <option value="Completed">Completed (Selesai)</option>
                    <option value="Departed">Departed (Berlayar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quay Crane Terpasang</label>
                  <input
                    type="text"
                    value={vesselForm.cranesAssigned}
                    onChange={(e) => setVesselForm({ ...vesselForm, cranesAssigned: e.target.value })}
                    placeholder="Quay Crane 01, Quay Crane 02"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimasi Kedatangan (ETA)</label>
                  <input
                    type="datetime-local"
                    value={vesselForm.eta}
                    onChange={(e) => setVesselForm({ ...vesselForm, eta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimasi Keberangkatan (ETD)</label>
                  <input
                    type="datetime-local"
                    value={vesselForm.etd}
                    onChange={(e) => setVesselForm({ ...vesselForm, etd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Bongkar (Box)</label>
                  <input
                    type="number"
                    value={vesselForm.totalDischarge}
                    onChange={(e) => setVesselForm({ ...vesselForm, totalDischarge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Muat (Box)</label>
                  <input
                    type="number"
                    value={vesselForm.totalLoading}
                    onChange={(e) => setVesselForm({ ...vesselForm, totalLoading: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVesselModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                >
                  {editingVessel ? 'Simpan Perubahan' : 'Tambah Jadwal Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
