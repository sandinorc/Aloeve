import { useState, useCallback } from 'react';
import apiClient from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export function usePaymentManagement() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async (filters = {}) => {
    console.log('[usePaymentManagement] Intentando fetchPayments con filtros:', filters);
    setLoading(true);
    try {
      // Note: The backend might not support complex PB filters directly via query params,
      // but we fetch all and filter locally if needed, or rely on the backend's implementation.
      const records = await apiClient.collection('pagos').getFullList();
      
      // Local filtering as fallback if backend doesn't support PB filter syntax
      let filteredRecords = records;
      if (filters.clienteId) filteredRecords = filteredRecords.filter(p => p.clienteId === filters.clienteId);
      if (filters.facilitadorId) filteredRecords = filteredRecords.filter(p => p.facilitadorId === filters.facilitadorId);
      if (filters.tallerId) filteredRecords = filteredRecords.filter(p => p.tallerId === filters.tallerId);
      
      // Sort by date descending
      filteredRecords.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      console.log('[usePaymentManagement] Éxito fetchPayments. Registros obtenidos:', filteredRecords.length);
      setPagos(filteredRecords);
      return { success: true, data: filteredRecords, error: null, details: null };
    } catch (err) {
      console.error('[usePaymentManagement] ERROR en fetchPayments:', err);
      toast.error('Error al cargar el historial de pagos');
      return { success: false, data: [], error: err.message, details: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = async (paymentData) => {
    console.log('[usePaymentManagement] Intentando createPayment con datos:', paymentData);
    
    if (!paymentData.monto) {
      console.error('[usePaymentManagement] Error de validación: monto es requerido');
      return { success: false, data: null, error: 'El monto es requerido', details: null };
    }

    setLoading(true);
    try {
      const record = await apiClient.collection('pagos').create(paymentData);
      
      console.log('[usePaymentManagement] Éxito createPayment. ID:', record.id);
      setPagos(prev => [record, ...prev].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      toast.success('Pago registrado exitosamente');
      
      return { success: true, data: record, error: null, details: null };
    } catch (err) {
      console.error('[usePaymentManagement] ERROR en createPayment:', err);
      toast.error(err.message || 'Error al registrar el pago');
      return { success: false, data: null, error: err.message, details: err };
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (id, paymentData) => {
    console.log(`[usePaymentManagement] Intentando updatePayment para ID: ${id}`, paymentData);
    
    if (!id) {
      console.error('[usePaymentManagement] Error de validación: ID es requerido para actualizar');
      return { success: false, data: null, error: 'ID es requerido', details: null };
    }

    setLoading(true);
    try {
      const record = await apiClient.collection('pagos').update(id, paymentData);
      
      console.log('[usePaymentManagement] Éxito updatePayment. ID:', record.id);
      setPagos(prev => prev.map(p => p.id === id ? record : p));
      toast.success('Pago actualizado exitosamente');
      
      return { success: true, data: record, error: null, details: null };
    } catch (err) {
      console.error('[usePaymentManagement] ERROR en updatePayment:', err);
      toast.error('Error al actualizar el pago');
      return { success: false, data: null, error: err.message, details: err };
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (id) => {
    console.log(`[usePaymentManagement] Intentando deletePayment para ID: ${id}`);
    
    if (!id) {
      console.error('[usePaymentManagement] Error de validación: ID es requerido para eliminar');
      return { success: false, data: null, error: 'ID es requerido', details: null };
    }

    setLoading(true);
    try {
      await apiClient.collection('pagos').delete(id);
      
      console.log('[usePaymentManagement] Éxito deletePayment. ID:', id);
      setPagos(prev => prev.filter(p => p.id !== id));
      toast.success('Pago eliminado exitosamente');
      
      return { success: true, data: true, error: null, details: null };
    } catch (err) {
      console.error('[usePaymentManagement] ERROR en deletePayment:', err);
      toast.error('Error al eliminar el pago');
      return { success: false, data: null, error: err.message, details: err };
    } finally {
      setLoading(false);
    }
  };

  const getPaymentSummary = useCallback((pagosList = pagos) => {
    if (!Array.isArray(pagosList)) {
      console.error('[usePaymentManagement] Error en getPaymentSummary: pagosList no es un array', pagosList);
      return { totalPagado: 0, totalPendiente: 0, countPagado: 0, countPendiente: 0, porcentajeCompletado: 0 };
    }

    const summary = {
      totalPagado: 0,
      totalPendiente: 0,
      countPagado: 0,
      countPendiente: 0,
      porcentajeCompletado: 0
    };

    pagosList.forEach(pago => {
      const monto = parseFloat(pago.monto) || 0;
      if (pago.estado === 'pagado') {
        summary.totalPagado += monto;
        summary.countPagado += 1;
      } else if (pago.estado === 'pendiente') {
        summary.totalPendiente += monto;
        summary.countPendiente += 1;
      }
    });

    const totalCount = summary.countPagado + summary.countPendiente;
    if (totalCount > 0) {
      summary.porcentajeCompletado = Math.round((summary.countPagado / totalCount) * 100);
    }

    return summary;
  }, [pagos]);

  return {
    pagos,
    loading,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentSummary
  };
}