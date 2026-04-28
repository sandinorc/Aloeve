import React, { useState } from 'react';
import CRMDashboard from './CRMDashboard';
import ClientDirectory from './ClientDirectory';
import SegmentationPage from './SegmentationPage';
import InactiveClientsPage from './InactiveClientsPage';
import ReferralsPage from './ReferralsPage';
import CRMReportsPage from './CRMReportsPage';
import { LayoutDashboard, Users, PieChart, UserMinus, Network, FileBarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

function CRMHeader({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directorio', label: 'Directorio', icon: Users },
    { id: 'segmentacion', label: 'Segmentación', icon: PieChart },
    { id: 'inactivos', label: 'Inactivos', icon: UserMinus },
    { id: 'referidos', label: 'Referidos', icon: Network },
    { id: 'reportes', label: 'Reportes', icon: FileBarChart2 },
  ];

  return (
    <div className="bg-white dark:bg-card border-b sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary font-serif">CRM Clientes</h1>
            <p className="text-sm text-muted-foreground">Gestión de relaciones, retención y fidelización</p>
          </div>
          
          <nav className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function CRMApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <CRMDashboard setActiveTab={setActiveTab} />;
      case 'directorio': return <ClientDirectory />;
      case 'segmentacion': return <SegmentationPage />;
      case 'inactivos': return <InactiveClientsPage />;
      case 'referidos': return <ReferralsPage />;
      case 'reportes': return <CRMReportsPage />;
      default: return <CRMDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CRMHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 py-6">
        {renderContent()}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}