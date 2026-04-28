import React, { useState } from 'react';
import FinanceHeader from '@/components/FinanceHeader';
import FinancesDashboard from './FinancesDashboard';
import IncomesPage from './IncomesPage';
import ExpensesPage from './ExpensesPage';
import ReportsPage from './ReportsPage';
import { Toaster } from 'sonner';

export default function FinancesApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FinancesDashboard />;
      case 'ingresos':
        return <IncomesPage />;
      case 'gastos':
        return <ExpensesPage />;
      case 'reportes':
        return <ReportsPage />;
      default:
        return <FinancesDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FinanceHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 py-6">
        {renderContent()}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}