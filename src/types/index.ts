export type ContainerSize = '20ft' | '40ft' | '45ft';
export type ContainerType = 'Dry' | 'Reefer' | 'Dangerous Goods (DG)' | 'Flat Rack' | 'Open Top' | 'Tank';
export type ContainerStatus = 'Gate-In' | 'In-Yard' | 'Vessel-Discharged' | 'Vessel-Loaded' | 'Gate-Out';
export type ContainerCategory = 'Import' | 'Export' | 'Transhipment' | 'Empty';
export type CustomsStatus = 'Pending' | 'Cleared' | 'Hold' | 'Red Channel';

export interface ContainerItem {
  id?: string;
  containerNo: string;
  isoCode: string;
  size: ContainerSize;
  type: ContainerType;
  status: ContainerStatus;
  category: ContainerCategory;
  sealNo: string;
  shippingLine: string;
  vesselName: string;
  yardLocation: string; // e.g. "BLK-A-04-02-3"
  grossWeight: number; // in kg
  tareWeight: number; // in kg
  netWeight: number; // in kg
  customsStatus: CustomsStatus;
  dwellTimeDays: number;
  temperature?: string; // for Reefer e.g. "-18°C"
  updatedAt: string;
  createdAt: string;
}

export type VesselStatus = 'Scheduled' | 'Approaching' | 'Berthing' | 'Operations' | 'Completed' | 'Departed';

export interface VesselItem {
  id?: string;
  vesselName: string;
  imoNumber: string;
  callSign: string;
  shippingAgent: string;
  berthSlot: string; // e.g. "Dermaga 01 - Utara"
  status: VesselStatus;
  eta: string;
  etd: string;
  totalDischarge: number;
  completedDischarge: number;
  totalLoading: number;
  completedLoading: number;
  cranesAssigned: string; // e.g. "QC-01, QC-02"
  productivityGMPH: number; // Gross Moves Per Hour
  createdAt?: string;
}

export type TransactionType = 'Gate-In' | 'Gate-Out' | 'Vessel-Discharge' | 'Vessel-Load' | 'Yard-Shift' | 'Inspection';

export interface OperationalTransaction {
  id?: string;
  transactionId: string;
  transactionType: TransactionType;
  containerNo: string;
  vesselName?: string;
  truckPlate?: string;
  driverName?: string;
  equipmentId?: string;
  sourceLocation?: string;
  targetLocation?: string;
  operatorName: string;
  notes?: string;
  timestamp: string;
}

export interface TrackingEvent {
  id?: string;
  containerNo: string;
  event: string;
  stage: string;
  location: string;
  operator: string;
  details?: string;
  timestamp: string;
}

export interface TerminalNotification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: string;
}

export interface EquipmentItem {
  id?: string;
  code: string;
  name: string;
  category: 'Quay Crane (QC)' | 'Rubber Tyred Gantry (RTG)' | 'Reach Stacker (RS)' | 'Terminal Truck (TT)';
  status: 'Active' | 'Idle' | 'Maintenance' | 'Standby';
  assignedTo: string;
  operator: string;
  fuelLevel: number;
  movesCompleted: number;
}

export type UserRole = 'superadmin' | 'supervisor' | 'gate_operator' | 'agent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  terminalCode: string;
}
