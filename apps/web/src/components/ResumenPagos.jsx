import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function ResumenPagos({ pagos = [] }) {
  const { getPaymentSummary } = usePaymentManagement();
  const summary = getPaymentSummary(pagos);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-green-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Pagado</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalPagado)}
            </h3>
          </div>
          <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Pendiente</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalPendiente)}
            </h3>
          </div>
          <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pagos Realizados</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{summary.countPagado}</h3>
              <span className="text-xs text-muted-foreground">
                ({summary.porcentajeCompletado}% del total)
              </span>
            </div>
          </div>
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pagos Pendientes</p>
            <h3 className="text-2xl font-bold">{summary.countPendiente}</h3>
          </div>
          <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}