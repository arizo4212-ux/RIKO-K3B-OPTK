import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { 
  ContainerItem, 
  VesselItem, 
  OperationalTransaction, 
  TrackingEvent, 
  TerminalNotification, 
  EquipmentItem 
} from '../types';
import { 
  INITIAL_CONTAINERS, 
  INITIAL_VESSELS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_TRACKING, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_EQUIPMENT 
} from '../data/initialData';

interface TerminalDataContextType {
  containers: ContainerItem[];
  vessels: VesselItem[];
  transactions: OperationalTransaction[];
  trackingEvents: TrackingEvent[];
  notifications: TerminalNotification[];
  equipment: EquipmentItem[];
  isDbConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  unreadNotificationCount: number;

  // CRUD Containers
  addContainer: (container: Omit<ContainerItem, 'id'>) => Promise<string | undefined>;
  updateContainer: (id: string, data: Partial<ContainerItem>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;

  // CRUD Vessels
  addVessel: (vessel: Omit<VesselItem, 'id'>) => Promise<string | undefined>;
  updateVessel: (id: string, data: Partial<VesselItem>) => Promise<void>;
  deleteVessel: (id: string) => Promise<void>;

  // CRUD Transactions
  addTransaction: (trx: Omit<OperationalTransaction, 'id'>) => Promise<string | undefined>;
  deleteTransaction: (id: string) => Promise<void>;

  // Tracking
  addTrackingEvent: (event: Omit<TrackingEvent, 'id'>) => Promise<string | undefined>;
  getTrackingForContainer: (containerNo: string) => TrackingEvent[];

  // Notifications
  addNotification: (notif: Omit<TerminalNotification, 'id'>) => Promise<string | undefined>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Equipment
  updateEquipment: (id: string, data: Partial<EquipmentItem>) => Promise<void>;

  // Database Tools
  reseedDatabase: () => Promise<void>;
}

const TerminalDataContext = createContext<TerminalDataContextType | undefined>(undefined);

export const TerminalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [containers, setContainers] = useState<ContainerItem[]>(INITIAL_CONTAINERS.map((c, i) => ({ id: `c-${i}`, ...c })));
  const [vessels, setVessels] = useState<VesselItem[]>(INITIAL_VESSELS.map((v, i) => ({ id: `v-${i}`, ...v })));
  const [transactions, setTransactions] = useState<OperationalTransaction[]>(INITIAL_TRANSACTIONS.map((t, i) => ({ id: `t-${i}`, ...t })));
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>(INITIAL_TRACKING.map((tr, i) => ({ id: `tr-${i}`, ...tr })));
  const [notifications, setNotifications] = useState<TerminalNotification[]>(INITIAL_NOTIFICATIONS.map((n, i) => ({ id: `n-${i}`, ...n })));
  const [equipment, setEquipment] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT.map((e, i) => ({ id: `e-${i}`, ...e })));

  const [isDbConnected, setIsDbConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  // Auto seed initial data if Firestore is empty
  const seedIfEmpty = useCallback(async () => {
    try {
      const contSnap = await getDocs(collection(db, 'containers'));
      if (contSnap.empty) {
        console.log('Seeding initial container terminal data to Firestore...');
        const batch = writeBatch(db);

        INITIAL_CONTAINERS.forEach((item) => {
          const ref = doc(collection(db, 'containers'));
          batch.set(ref, item);
        });

        INITIAL_VESSELS.forEach((item) => {
          const ref = doc(collection(db, 'vessels'));
          batch.set(ref, item);
        });

        INITIAL_TRANSACTIONS.forEach((item) => {
          const ref = doc(collection(db, 'transactions'));
          batch.set(ref, item);
        });

        INITIAL_TRACKING.forEach((item) => {
          const ref = doc(collection(db, 'tracking_history'));
          batch.set(ref, item);
        });

        INITIAL_NOTIFICATIONS.forEach((item) => {
          const ref = doc(collection(db, 'notifications'));
          batch.set(ref, item);
        });

        INITIAL_EQUIPMENT.forEach((item) => {
          const ref = doc(collection(db, 'equipment'));
          batch.set(ref, item);
        });

        await batch.commit();
        console.log('Seeding completed successfully.');
      }
    } catch (err) {
      console.warn('Initial seeding check:', err);
    }
  }, []);

  // Subscribe to real-time updates when user is authenticated with profile
  useEffect(() => {
    if (!profile) {
      return;
    }

    setIsSyncing(true);
    seedIfEmpty();

    const unsubscribers: (() => void)[] = [];

    // 1. Containers Listener
    const unsubContainers = onSnapshot(
      collection(db, 'containers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ContainerItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<ContainerItem, 'id'>) });
          });
          setContainers(list);
        }
        setIsDbConnected(true);
        setIsSyncing(false);
        setLastSyncTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'containers');
      }
    );
    unsubscribers.push(unsubContainers);

    // 2. Vessels Listener
    const unsubVessels = onSnapshot(
      collection(db, 'vessels'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: VesselItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<VesselItem, 'id'>) });
          });
          setVessels(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'vessels');
      }
    );
    unsubscribers.push(unsubVessels);

    // 3. Transactions Listener
    const qTrx = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(100));
    const unsubTrx = onSnapshot(
      qTrx,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: OperationalTransaction[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<OperationalTransaction, 'id'>) });
          });
          setTransactions(list);
        }
      },
      () => {
        onSnapshot(collection(db, 'transactions'), (snap) => {
          if (!snap.empty) {
            const list: OperationalTransaction[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
            setTransactions(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          }
        }, (err2) => {
          handleFirestoreError(err2, OperationType.LIST, 'transactions');
        });
      }
    );
    unsubscribers.push(unsubTrx);

    // 4. Tracking History Listener
    const qTracking = query(collection(db, 'tracking_history'), orderBy('timestamp', 'desc'), limit(200));
    const unsubTracking = onSnapshot(
      qTracking,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: TrackingEvent[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<TrackingEvent, 'id'>) });
          });
          setTrackingEvents(list);
        }
      },
      () => {
        onSnapshot(collection(db, 'tracking_history'), (snap) => {
          if (!snap.empty) {
            const list: TrackingEvent[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
            setTrackingEvents(list);
          }
        });
      }
    );
    unsubscribers.push(unsubTracking);

    // 5. Notifications Listener
    const qNotif = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(50));
    const unsubNotif = onSnapshot(
      qNotif,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: TerminalNotification[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<TerminalNotification, 'id'>) });
          });
          setNotifications(list);
        }
      },
      () => {
        onSnapshot(collection(db, 'notifications'), (snap) => {
          if (!snap.empty) {
            const list: TerminalNotification[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
            setNotifications(list);
          }
        });
      }
    );
    unsubscribers.push(unsubNotif);

    // 6. Equipment Listener
    const unsubEquipment = onSnapshot(
      collection(db, 'equipment'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: EquipmentItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<EquipmentItem, 'id'>) });
          });
          setEquipment(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'equipment');
      }
    );
    unsubscribers.push(unsubEquipment);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [profile, seedIfEmpty]);

  // Notifications Helpers
  const addNotification = async (notif: Omit<TerminalNotification, 'id'>): Promise<string | undefined> => {
    try {
      const ref = await addDoc(collection(db, 'notifications'), notif);
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'notifications');
      setNotifications((prev) => [{ id: `n-${Date.now()}`, ...notif }, ...prev]);
      return `local-${Date.now()}`;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      if (!id.startsWith('local-') && !id.startsWith('n-')) {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      }
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (n.id && !n.id.startsWith('local-') && !n.id.startsWith('n-')) {
          batch.delete(doc(db, 'notifications', n.id));
        }
      });
      await batch.commit();
      setNotifications([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'notifications');
      setNotifications([]);
    }
  };

  // Tracking Event Helpers
  const addTrackingEvent = async (event: Omit<TrackingEvent, 'id'>): Promise<string | undefined> => {
    try {
      const ref = await addDoc(collection(db, 'tracking_history'), event);
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tracking_history');
      setTrackingEvents((prev) => [{ id: `tr-${Date.now()}`, ...event }, ...prev]);
      return `local-${Date.now()}`;
    }
  };

  const getTrackingForContainer = (containerNo: string) => {
    return trackingEvents
      .filter((t) => t.containerNo.trim().toUpperCase() === containerNo.trim().toUpperCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Container CRUD
  const addContainer = async (item: Omit<ContainerItem, 'id'>): Promise<string | undefined> => {
    try {
      const now = new Date().toISOString();
      const payload: Omit<ContainerItem, 'id'> = {
        ...item,
        createdAt: item.createdAt || now,
        updatedAt: now
      };
      const ref = await addDoc(collection(db, 'containers'), payload);

      // Log initial tracking event
      await addTrackingEvent({
        containerNo: item.containerNo,
        event: `Registrasi Peti Kemas (${item.status})`,
        stage: item.status,
        location: item.yardLocation || 'Terminal Gate',
        operator: 'Sistem Peti Kemas Online',
        details: `Peti kemas ${item.size} ${item.type} terdaftar di sistem. No Segel: ${item.sealNo || '-'}`,
        timestamp: now
      });

      // Dispatch notification
      await addNotification({
        title: `Peti Kemas Baru: ${item.containerNo}`,
        message: `${item.shippingLine} - ${item.size} ${item.type} berhasil didaftarkan di ${item.yardLocation || 'Yard'}.`,
        type: 'info',
        priority: 'low',
        read: false,
        timestamp: now
      });

      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'containers');
      setContainers((prev) => [{ id: `local-${Date.now()}`, ...item }, ...prev]);
      return `local-${Date.now()}`;
    }
  };

  const updateContainer = async (id: string, data: Partial<ContainerItem>) => {
    try {
      const now = new Date().toISOString();
      if (!id.startsWith('local-') && !id.startsWith('c-')) {
        await updateDoc(doc(db, 'containers', id), {
          ...data,
          updatedAt: now
        });
      } else {
        setContainers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: now } : c)));
      }

      if (data.containerNo && (data.status || data.yardLocation)) {
        await addTrackingEvent({
          containerNo: data.containerNo,
          event: data.status ? `Perubahan Status -> ${data.status}` : 'Update Posisi Yard',
          stage: data.status || 'Yard',
          location: data.yardLocation || 'Terminal Area',
          operator: 'Operator Lapangan',
          details: `Pembaruan data operasional: Lokasi: ${data.yardLocation || '-'}, Status: ${data.status || '-'}`,
          timestamp: now
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `containers/${id}`);
    }
  };

  const deleteContainer = async (id: string) => {
    try {
      const cont = containers.find((c) => c.id === id);
      if (!id.startsWith('local-') && !id.startsWith('c-')) {
        await deleteDoc(doc(db, 'containers', id));
      }
      setContainers((prev) => prev.filter((c) => c.id !== id));

      if (cont) {
        await addNotification({
          title: `Peti Kemas Dihapus: ${cont.containerNo}`,
          message: `Data peti kemas ${cont.containerNo} (${cont.shippingLine}) telah dihapus dari sistem.`,
          type: 'warning',
          priority: 'medium',
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `containers/${id}`);
    }
  };

  // Vessel CRUD
  const addVessel = async (vessel: Omit<VesselItem, 'id'>): Promise<string | undefined> => {
    try {
      const now = new Date().toISOString();
      const payload = {
        ...vessel,
        createdAt: vessel.createdAt || now
      };
      const ref = await addDoc(collection(db, 'vessels'), payload);

      await addNotification({
        title: `Jadwal Kapal Baru: ${vessel.vesselName}`,
        message: `Kapal dijadwalkan sandar di ${vessel.berthSlot}. ETA: ${new Date(vessel.eta).toLocaleString('id-ID')}`,
        type: 'info',
        priority: 'medium',
        read: false,
        timestamp: now
      });

      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'vessels');
      setVessels((prev) => [{ id: `local-${Date.now()}`, ...vessel }, ...prev]);
      return `local-${Date.now()}`;
    }
  };

  const updateVessel = async (id: string, data: Partial<VesselItem>) => {
    try {
      if (!id.startsWith('local-') && !id.startsWith('v-')) {
        await updateDoc(doc(db, 'vessels', id), data);
      } else {
        setVessels((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
      }

      if (data.vesselName && data.status) {
        await addNotification({
          title: `Status Kapal Diperbarui: ${data.vesselName}`,
          message: `Status operasional kapal sekarang: ${data.status}. Dermaga: ${data.berthSlot || 'Tetap'}.`,
          type: data.status === 'Completed' || data.status === 'Departed' ? 'success' : 'info',
          priority: 'medium',
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `vessels/${id}`);
    }
  };

  const deleteVessel = async (id: string) => {
    try {
      const v = vessels.find((item) => item.id === id);
      if (!id.startsWith('local-') && !id.startsWith('v-')) {
        await deleteDoc(doc(db, 'vessels', id));
      }
      setVessels((prev) => prev.filter((item) => item.id !== id));

      if (v) {
        await addNotification({
          title: `Jadwal Kapal Dihapus: ${v.vesselName}`,
          message: `Data jadwal kapal ${v.vesselName} telah dihapus dari antrean dermaga.`,
          type: 'warning',
          priority: 'low',
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `vessels/${id}`);
    }
  };

  // Transaction CRUD & Side-Effects
  const addTransaction = async (trx: Omit<OperationalTransaction, 'id'>): Promise<string | undefined> => {
    try {
      const now = trx.timestamp || new Date().toISOString();
      const ref = await addDoc(collection(db, 'transactions'), {
        ...trx,
        timestamp: now
      });

      // Synchronize container state based on transaction type
      const targetContainer = containers.find((c) => c.containerNo.trim().toUpperCase() === trx.containerNo.trim().toUpperCase());
      
      let nextStatus: ContainerItem['status'] = 'In-Yard';
      let nextLocation = trx.targetLocation || targetContainer?.yardLocation || 'Yard Area';

      if (trx.transactionType === 'Gate-In') {
        nextStatus = 'In-Yard';
      } else if (trx.transactionType === 'Gate-Out') {
        nextStatus = 'Gate-Out';
      } else if (trx.transactionType === 'Vessel-Discharge') {
        nextStatus = 'Vessel-Discharged';
      } else if (trx.transactionType === 'Vessel-Load') {
        nextStatus = 'Vessel-Loaded';
      } else if (trx.transactionType === 'Yard-Shift') {
        nextStatus = 'In-Yard';
      }

      if (targetContainer && targetContainer.id) {
        await updateContainer(targetContainer.id, {
          status: nextStatus,
          yardLocation: nextLocation
        });
      }

      // Add audit tracking event
      await addTrackingEvent({
        containerNo: trx.containerNo,
        event: `Transaksi ${trx.transactionType}`,
        stage: trx.transactionType,
        location: trx.targetLocation || trx.sourceLocation || 'Terminal',
        operator: trx.operatorName,
        details: `${trx.transactionType}: Truck ${trx.truckPlate || '-'}, Alat: ${trx.equipmentId || '-'}. Catatan: ${trx.notes || 'Normal'}`,
        timestamp: now
      });

      // Dispatch alert
      await addNotification({
        title: `Transaksi ${trx.transactionType}: ${trx.containerNo}`,
        message: `${trx.containerNo} diproses oleh ${trx.operatorName} (${trx.equipmentId || 'Lane/Quay'}).`,
        type: trx.transactionType === 'Gate-Out' ? 'warning' : 'success',
        priority: 'low',
        read: false,
        timestamp: now
      });

      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
      setTransactions((prev) => [{ id: `local-${Date.now()}`, ...trx }, ...prev]);
      return `local-${Date.now()}`;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!id.startsWith('local-') && !id.startsWith('t-')) {
        await deleteDoc(doc(db, 'transactions', id));
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    }
  };

  // Equipment update
  const updateEquipment = async (id: string, data: Partial<EquipmentItem>) => {
    try {
      if (!id.startsWith('local-') && !id.startsWith('e-')) {
        await updateDoc(doc(db, 'equipment', id), data);
      } else {
        setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `equipment/${id}`);
    }
  };

  // Re-seed all sample data for test/demo
  const reseedDatabase = async () => {
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      INITIAL_CONTAINERS.forEach((item) => {
        const ref = doc(collection(db, 'containers'));
        batch.set(ref, item);
      });
      INITIAL_VESSELS.forEach((item) => {
        const ref = doc(collection(db, 'vessels'));
        batch.set(ref, item);
      });
      INITIAL_TRANSACTIONS.forEach((item) => {
        const ref = doc(collection(db, 'transactions'));
        batch.set(ref, item);
      });
      INITIAL_TRACKING.forEach((item) => {
        const ref = doc(collection(db, 'tracking_history'));
        batch.set(ref, item);
      });
      INITIAL_NOTIFICATIONS.forEach((item) => {
        const ref = doc(collection(db, 'notifications'));
        batch.set(ref, item);
      });
      INITIAL_EQUIPMENT.forEach((item) => {
        const ref = doc(collection(db, 'equipment'));
        batch.set(ref, item);
      });
      await batch.commit();
      setIsSyncing(false);
      setLastSyncTime(new Date());
    } catch (err) {
      setIsSyncing(false);
      handleFirestoreError(err, OperationType.WRITE, 'reseed');
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <TerminalDataContext.Provider
      value={{
        containers,
        vessels,
        transactions,
        trackingEvents,
        notifications,
        equipment,
        isDbConnected,
        isSyncing,
        lastSyncTime,
        unreadNotificationCount,

        addContainer,
        updateContainer,
        deleteContainer,

        addVessel,
        updateVessel,
        deleteVessel,

        addTransaction,
        deleteTransaction,

        addTrackingEvent,
        getTrackingForContainer,

        addNotification,
        markNotificationRead,
        clearAllNotifications,

        updateEquipment,
        reseedDatabase
      }}
    >
      {children}
    </TerminalDataContext.Provider>
  );
};

export const useTerminalData = () => {
  const context = useContext(TerminalDataContext);
  if (!context) {
    throw new Error('useTerminalData must be used within a TerminalDataProvider');
  }
  return context;
};
