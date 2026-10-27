/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TerminalDataProvider } from './context/TerminalDataContext';
import { LoginModal } from './components/auth/LoginModal';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { MasterDataView } from './components/master/MasterDataView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { YardView } from './components/yard/YardView';
import { TrackingView } from './components/tracking/TrackingView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

const MainLayout: React.FC = () => {
  const { profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [quickGateInOpen, setQuickGateInOpen] = useState(false);

  // If loading or not authenticated, render the pre-app login gate
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
          Memuat Sistem Operasional Terminal Peti Kemas...
        </p>
      </div>
    );
  }

  if (!profile) {
    return <LoginModal />;
  }

  const handleOpenQuickGateIn = () => {
    setActiveTab('transactions');
    setQuickGateInOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar onToggleNotifications={() => setIsNotificationOpen(!isNotificationOpen)} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <AnalyticsDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenQuickGateIn={handleOpenQuickGateIn}
            />
          )}

          {activeTab === 'master' && <MasterDataView />}

          {activeTab === 'transactions' && (
            <TransactionsView initialOpenGateIn={quickGateInOpen} />
          )}

          {activeTab === 'yard' && <YardView />}

          {activeTab === 'tracking' && <TrackingView />}

          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TerminalDataProvider>
        <MainLayout />
      </TerminalDataProvider>
    </AuthProvider>
  );
}
