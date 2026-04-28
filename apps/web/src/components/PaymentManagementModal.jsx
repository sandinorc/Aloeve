import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';
import ResumenPagos from './ResumenPagos';
import TablaHistorialPagos from './TablaHistorialPagos';
import ModalRegistroPago from './ModalRegistroPago';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';

export default function PaymentManagementModal({ 
  isOpen, 
  onClose, 
  entityType, // 'cliente' or 'facilitador'
  entityId, 
  entityName 
}) {
  const { pagos, loading, fetchPayments, deletePayment } = usePaymentManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagoToEdit, setPagoToEdit] = useState(null);

  useEffect(() => {
    if (isOpen && entityId) {
      const filters = entityType === 'cliente' ? { clienteId: entityId } : { facilitadorId: entityId };
      fetchPayments(filters).then(result => {
        if (!result.success) {
          console.error('[PaymentManagementModal] Error al cargar pagos:', result.error);
        }
      });
    }
  }, [isOpen, entityId, entityType, fetchPayments]);

  const handleEdit = (pago) => {
    setPagoToEdit(pago);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setPagoToEdit(null);
    setIsFormOpen(true);
  };

  const handlePaymentSaved = () => {
    const filters = entityType === 'cliente' ? { clienteId: entityId } : { facilitadorId: entityId };
    fetchPayments(filters);
  };

  const handleDelete = async (id) => {
    const result = await deletePayment(id);
    if (!result.success) {
      console.error('[PaymentManagementModal] Error al eliminar pago:', result.error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div>
              <DialogTitle className="text-2xl font-serif flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                Gestión de Pagos
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Historial y estado de cuenta para: <span className="font-semibold text-foreground">{entityName}</span>
              </p>
            </div>
            <Button onClick={handleAddNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Registrar Pago
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            <ResumenPagos pagos={pagos} />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Historial de Transacciones</h3>
              <TablaHistorialPagos 
                pagos={pagos} 
                isLoading={loading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ModalRegistroPago 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tipo={entityType}
        clienteId={entityType === 'cliente' ? entityId : null}
        facilitadorId={entityType === 'facilitador' ? entityId : null}
        pagoToEdit={pagoToEdit}
        onPaymentSaved={handlePaymentSaved}
      />
    </>
  );
}