import React from 'react';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, FileBarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FinanceHeader({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingresos', label: 'Ingresos', icon: ArrowDownToLine },
    { id: 'gastos', label: 'Gastos', icon: ArrowUpFromLine },
    { id: 'reportes', label: 'Reportes', icon: FileBarChart2 },
  ];

  return (
    <div className="bg-white dark:bg-card border-b sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Control Financiero</h1>
            <p className="text-sm text-muted-foreground">Gestión de ingresos, gastos y reportes</p>
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