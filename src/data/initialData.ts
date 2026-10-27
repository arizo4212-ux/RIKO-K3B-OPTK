import { ContainerItem, VesselItem, OperationalTransaction, TrackingEvent, TerminalNotification, EquipmentItem } from '../types';

export const INITIAL_CONTAINERS: Omit<ContainerItem, 'id'>[] = [
  {
    containerNo: 'MSKU-9821421',
    isoCode: '45G1',
    size: '40ft',
    type: 'Dry',
    status: 'In-Yard',
    category: 'Import',
    sealNo: 'ML-JKT-88291',
    shippingLine: 'Maersk Line',
    vesselName: 'MV Maersk Seletar',
    yardLocation: 'BLK-A-04-02-3',
    grossWeight: 28450,
    tareWeight: 3750,
    netWeight: 24700,
    customsStatus: 'Cleared',
    dwellTimeDays: 2,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    containerNo: 'TCLU-4109823',
    isoCode: '22R1',
    size: '20ft',
    type: 'Reefer',
    status: 'In-Yard',
    category: 'Export',
    sealNo: 'SL-ID-99210',
    shippingLine: 'Samudera Indonesia',
    vesselName: 'MV Nusantara Jaya',
    yardLocation: 'BLK-C-02-01-2',
    grossWeight: 21800,
    tareWeight: 3100,
    netWeight: 18700,
    customsStatus: 'Cleared',
    dwellTimeDays: 1,
    temperature: '-18.5°C',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    containerNo: 'CMAU-6029184',
    isoCode: '42P3',
    size: '40ft',
    type: 'Dangerous Goods (DG)',
    status: 'In-Yard',
    category: 'Import',
    sealNo: 'CMA-DG-11029',
    shippingLine: 'CMA CGM',
    vesselName: 'MV CMA CGM Jacques',
    yardLocation: 'BLK-D-01-03-1',
    grossWeight: 26500,
    tareWeight: 4200,
    netWeight: 22300,
    customsStatus: 'Red Channel',
    dwellTimeDays: 4,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    containerNo: 'ONEU-7821903',
    isoCode: '22G1',
    size: '20ft',
    type: 'Dry',
    status: 'Gate-In',
    category: 'Export',
    sealNo: 'ONE-EXP-44102',
    shippingLine: 'Ocean Network Express (ONE)',
    vesselName: 'MV Jakarta Bridge',
    yardLocation: 'BLK-A-01-04-2',
    grossWeight: 18200,
    tareWeight: 2250,
    netWeight: 15950,
    customsStatus: 'Pending',
    dwellTimeDays: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    containerNo: 'MRTU-3391820',
    isoCode: '45G1',
    size: '40ft',
    type: 'Dry',
    status: 'Vessel-Discharged',
    category: 'Transhipment',
    sealNo: 'MRT-TR-00918',
    shippingLine: 'Meratus Line',
    vesselName: 'KM Meratus Jayakarta',
    yardLocation: 'BLK-B-03-02-1',
    grossWeight: 29100,
    tareWeight: 3800,
    netWeight: 25300,
    customsStatus: 'Cleared',
    dwellTimeDays: 1,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    containerNo: 'SMLU-1120934',
    isoCode: '45U1',
    size: '40ft',
    type: 'Open Top',
    status: 'Vessel-Loaded',
    category: 'Export',
    sealNo: 'SML-ID-3391',
    shippingLine: 'Samudera Indonesia',
    vesselName: 'MV Nusantara Jaya',
    yardLocation: 'BAY-14-04-82',
    grossWeight: 30200,
    tareWeight: 4100,
    netWeight: 26100,
    customsStatus: 'Cleared',
    dwellTimeDays: 3,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_VESSELS: Omit<VesselItem, 'id'>[] = [
  {
    vesselName: 'MV Nusantara Jaya',
    imoNumber: 'IMO-9481923',
    callSign: 'YDYK',
    shippingAgent: 'Samudera Agency',
    berthSlot: 'Dermaga 01 - Utara',
    status: 'Operations',
    eta: new Date(Date.now() - 8 * 3600000).toISOString(),
    etd: new Date(Date.now() + 16 * 3600000).toISOString(),
    totalDischarge: 450,
    completedDischarge: 390,
    totalLoading: 320,
    completedLoading: 210,
    cranesAssigned: 'Quay Crane 01, Quay Crane 02',
    productivityGMPH: 28.5,
    createdAt: new Date().toISOString()
  },
  {
    vesselName: 'KM Meratus Jayakarta',
    imoNumber: 'IMO-9331045',
    callSign: 'PKMD',
    shippingAgent: 'Meratus Shipping',
    berthSlot: 'Dermaga 02 - Tengah',
    status: 'Operations',
    eta: new Date(Date.now() - 14 * 3600000).toISOString(),
    etd: new Date(Date.now() + 10 * 3600000).toISOString(),
    totalDischarge: 280,
    completedDischarge: 280,
    totalLoading: 250,
    completedLoading: 195,
    cranesAssigned: 'Quay Crane 03',
    productivityGMPH: 31.2,
    createdAt: new Date().toISOString()
  },
  {
    vesselName: 'MV Maersk Seletar',
    imoNumber: 'IMO-9720491',
    callSign: '9V882',
    shippingAgent: 'Maersk Indonesia',
    berthSlot: 'Dermaga 03 - Selatan',
    status: 'Approaching',
    eta: new Date(Date.now() + 4 * 3600000).toISOString(),
    etd: new Date(Date.now() + 36 * 3600000).toISOString(),
    totalDischarge: 850,
    completedDischarge: 0,
    totalLoading: 620,
    completedLoading: 0,
    cranesAssigned: 'Quay Crane 04, Quay Crane 05',
    productivityGMPH: 0,
    createdAt: new Date().toISOString()
  },
  {
    vesselName: 'KM Tanto Express',
    imoNumber: 'IMO-9120448',
    callSign: 'PKTX',
    shippingAgent: 'Tanto Intim Line',
    berthSlot: 'Dermaga 04 - Timur',
    status: 'Scheduled',
    eta: new Date(Date.now() + 24 * 3600000).toISOString(),
    etd: new Date(Date.now() + 52 * 3600000).toISOString(),
    totalDischarge: 190,
    completedDischarge: 0,
    totalLoading: 210,
    completedLoading: 0,
    cranesAssigned: 'Standby QC-02',
    productivityGMPH: 0,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TRANSACTIONS: Omit<OperationalTransaction, 'id'>[] = [
  {
    transactionId: 'TRX-GT-20261026-001',
    transactionType: 'Gate-In',
    containerNo: 'ONEU-7821903',
    truckPlate: 'B 9201 UXT',
    driverName: 'Suryadi Pratama',
    equipmentId: 'Gate Lane 02',
    sourceLocation: 'Luar Pelabuhan',
    targetLocation: 'BLK-A-01-04-2',
    operatorName: 'Rian Setyadi (Gate)',
    notes: 'Pemeriksaan fisik dan segel utuh, berat sesuai manifes',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString()
  },
  {
    transactionId: 'TRX-DC-20261026-002',
    transactionType: 'Vessel-Discharge',
    containerNo: 'MRTU-3391820',
    vesselName: 'KM Meratus Jayakarta',
    equipmentId: 'QC-03 (Quay Crane 3)',
    sourceLocation: 'Bay 08 KM Meratus',
    targetLocation: 'BLK-B-03-02-1',
    operatorName: 'Agus Subagyo (Crane Operator)',
    notes: 'Bongkar dermaga lancar tanpa kendala teknis',
    timestamp: new Date(Date.now() - 110 * 60000).toISOString()
  },
  {
    transactionId: 'TRX-LD-20261026-003',
    transactionType: 'Vessel-Load',
    containerNo: 'SMLU-1120934',
    vesselName: 'MV Nusantara Jaya',
    equipmentId: 'QC-01 (Quay Crane 1)',
    sourceLocation: 'BLK-A-03-01-2',
    targetLocation: 'Bay 14 Onboard',
    operatorName: 'Bambang Pratama (Stevedoring)',
    notes: 'Muat kontainer export ke atas palka kapal',
    timestamp: new Date(Date.now() - 190 * 60000).toISOString()
  },
  {
    transactionId: 'TRX-YS-20261026-004',
    transactionType: 'Yard-Shift',
    containerNo: 'TCLU-4109823',
    equipmentId: 'RTG-02',
    sourceLocation: 'BLK-C-01-01-1',
    targetLocation: 'BLK-C-02-01-2',
    operatorName: 'Danang Sutrisno',
    notes: 'Relokasi ke power socket Reefer terminal 2',
    timestamp: new Date(Date.now() - 280 * 60000).toISOString()
  }
];

export const INITIAL_TRACKING: Omit<TrackingEvent, 'id'>[] = [
  {
    containerNo: 'MSKU-9821421',
    event: 'Gate-In Verifikasi',
    stage: 'Gate In',
    location: 'Gate 01 Inbound',
    operator: 'Rian Setyadi',
    details: 'Truck B 9112 PQU tiba, Surat Jalan dan Segel No. ML-JKT-88291 terverifikasi.',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    containerNo: 'MSKU-9821421',
    event: 'Penempatan Lapangan (Yard Stacking)',
    stage: 'Yard',
    location: 'BLK-A-04-02-3',
    operator: 'Bambang Pratama',
    details: 'Disimpan di Blok A Lapangan Penumpukan 40ft oleh RTG-01.',
    timestamp: new Date(Date.now() - 46 * 3600000).toISOString()
  },
  {
    containerNo: 'MSKU-9821421',
    event: 'Pemeriksaan Bea Cukai SPPB Selesai',
    stage: 'Customs',
    location: 'Bea Cukai KPU Tanjung Priok',
    operator: 'Petugas Bea Cukai RI',
    details: 'Status Jalur Hijau disetujui, siap pengeluaran (Delivery).',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    containerNo: 'TCLU-4109823',
    event: 'Koneksi Reefer Plug-In',
    stage: 'Reefer Monitoring',
    location: 'BLK-C-02-01-2',
    operator: 'Teknisi Reefer Port',
    details: 'Monitoring suhu stabil -18.5°C, tegangan 380V normal.',
    timestamp: new Date(Date.now() - 20 * 3600000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: Omit<TerminalNotification, 'id'>[] = [
  {
    title: 'Kapal MV Nusantara Jaya Beroperasi',
    message: 'Operasi muat dermaga 01 sedang berlangsung dengan produktivitas 28.5 GMPH.',
    type: 'info',
    priority: 'medium',
    read: false,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    title: 'Peringatan Dwell Time Kontainer',
    message: 'Kontainer CMAU-6029184 di Blok D telah mencapai hari ke-4 di lapangan.',
    type: 'warning',
    priority: 'high',
    read: false,
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    title: 'Gate-In Ekspor Berhasil',
    message: 'Peti kemas ONEU-7821903 telah diverifikasi di Gate 02 menuju Blok A.',
    type: 'success',
    priority: 'low',
    read: true,
    timestamp: new Date(Date.now() - 120 * 60000).toISOString()
  }
];

export const INITIAL_EQUIPMENT: Omit<EquipmentItem, 'id'>[] = [
  {
    code: 'QC-01',
    name: 'Quay Crane 01 (Post-Panamax)',
    category: 'Quay Crane (QC)',
    status: 'Active',
    assignedTo: 'Dermaga 01 (MV Nusantara Jaya)',
    operator: 'Rahmat Hidayat',
    fuelLevel: 92,
    movesCompleted: 142
  },
  {
    code: 'QC-02',
    name: 'Quay Crane 02 (Super Post-Panamax)',
    category: 'Quay Crane (QC)',
    status: 'Active',
    assignedTo: 'Dermaga 01 (MV Nusantara Jaya)',
    operator: 'Joko Widodo',
    fuelLevel: 88,
    movesCompleted: 168
  },
  {
    code: 'QC-03',
    name: 'Quay Crane 03',
    category: 'Quay Crane (QC)',
    status: 'Active',
    assignedTo: 'Dermaga 02 (KM Meratus)',
    operator: 'Agus Subagyo',
    fuelLevel: 75,
    movesCompleted: 185
  },
  {
    code: 'RTG-01',
    name: 'Rubber Tyred Gantry 01 (Hybrid)',
    category: 'Rubber Tyred Gantry (RTG)',
    status: 'Active',
    assignedTo: 'Blok A (Dry 40ft)',
    operator: 'Danang Sutrisno',
    fuelLevel: 84,
    movesCompleted: 215
  },
  {
    code: 'RTG-02',
    name: 'Rubber Tyred Gantry 02 (Electric)',
    category: 'Rubber Tyred Gantry (RTG)',
    status: 'Active',
    assignedTo: 'Blok C (Reefer Yard)',
    operator: 'Eko Wahyudi',
    fuelLevel: 96,
    movesCompleted: 174
  },
  {
    code: 'RS-01',
    name: 'Konecranes Reach Stacker 01',
    category: 'Reach Stacker (RS)',
    status: 'Standby',
    assignedTo: 'Blok D (Hazardous DG)',
    operator: 'Ilham Kurnia',
    fuelLevel: 68,
    movesCompleted: 89
  },
  {
    code: 'TT-05',
    name: 'Terminal Tractor 05 (Kalmar)',
    category: 'Terminal Truck (TT)',
    status: 'Active',
    assignedTo: 'Quay-to-Yard Shuttle',
    operator: 'Dedi Saputra',
    fuelLevel: 70,
    movesCompleted: 310
  }
];
