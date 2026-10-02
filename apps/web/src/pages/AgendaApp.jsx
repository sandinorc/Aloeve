import React from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AgendaDashboard from './AgendaDashboard';
import SessionsPage from './SessionsPage';
import DailyViewPage from './DailyViewPage';
import AgendaReportsPage from './AgendaReportsPage';
import FacilitatoresPage from './FacilitatoresPage';
import FacilitadorDetailPage from './FacilitadorDetailPage';
import AsignarTalleresPage from './AsignarTalleresPage';
import { LayoutDashboard, CalendarDays, CalendarClock, FileBarChart2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

function AgendaHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current path
  const path = location.pathname;
  let activeTab = 'dashboard';
  if (path.includes('/sesiones')) activeTab = 'sesiones';
  if (path.includes('/diaria')) activeTab = 'diaria';
  if (path.includes('/reportes')) activeTab = 'reportes';
  if (path.includes('/facilitadores')) activeTab = 'facilitadores';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/agenda' },
    { id: 'sesiones', label: 'Sesiones', icon: CalendarDays, path: '/agenda/sesiones' },
    { id: 'diaria', label: 'Vista Diaria', icon: CalendarClock, path: '/agenda/diaria' },
    { id: 'facilitadores', label: 'Facilitadores', icon: Users, path: '/agenda/facilitadores' },
    { id: 'reportes', label: 'Reportes', icon: FileBarChart2, path: '/agenda/reportes' },
  ];

  return (
    <div className="bg-white dark:bg-card border-b sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary font-serif">Agenda y Sesiones</h1>
            <p className="text-sm text-muted-foreground">Gestión de eventos, facilitadores y participantes</p>
          </div>
          
          <nav className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
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

export default function AgendaApp() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AgendaHeader />
      <main className="flex-1 py-6">
        <Routes>
          <Route path="/" element={<AgendaDashboard />} />
          <Route path="/sesiones" element={<SessionsPage />} />
          <Route path="/diaria" element={<DailyViewPage />} />
          <Route path="/reportes" element={<AgendaReportsPage />} />
          <Route path="/facilitadores" element={<FacilitatoresPage />} />
          <Route path="/facilitadores/:id" element={<FacilitadorDetailPage />} />
          <Route path="/facilitadores/:id/asignar-talleres" element={<AsignarTalleresPage />} />
          <Route path="*" element={<Navigate to="/agenda" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}