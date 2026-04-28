import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, subMonths } from 'date-fns';

export const useFinanceCalculations = () => {
  
  const calculateMonthlyMetrics = (ingresos = [], gastos = []) => {
    const totalIngresos = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
    
    const gastosFijos = gastos
      .filter(g => g.tipo === 'fijo mensual')
      .reduce((sum, item) => sum + (item.monto || 0), 0);
      
    const gastosVariables = gastos
      .filter(g => g.tipo !== 'fijo mensual')
      .reduce((sum, item) => sum + (item.monto || 0), 0);
      
    const margen = totalIngresos - (gastosFijos + gastosVariables);
    
    return { totalIngresos, gastosFijos, gastosVariables, margen };
  };

  const calculateBreakEven = (gastosFijos, gastosVariables, ingresos) => {
    const totalGastos = gastosFijos + gastosVariables;
    if (totalGastos === 0) return 100;
    if (ingresos === 0) return 0;
    const percentage = (ingresos / totalGastos) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  const calculateMeta2x = (gastosFijos, gastosVariables, ingresos) => {
    const meta = (gastosFijos + gastosVariables) * 2;
    if (meta === 0) return 100;
    if (ingresos === 0) return 0;
    const percentage = (ingresos / meta) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  const compareMonths = (currentMetrics, previousMetrics) => {
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      ingresosGrowth: calculateGrowth(currentMetrics.totalIngresos, previousMetrics.totalIngresos),
      gastosGrowth: calculateGrowth(
        currentMetrics.gastosFijos + currentMetrics.gastosVariables, 
        previousMetrics.gastosFijos + previousMetrics.gastosVariables
      ),
      margenGrowth: calculateGrowth(currentMetrics.margen, previousMetrics.margen)
    };
  };

  const validateLineOfBusinessLimit = (ingresos = []) => {
    const total = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
    if (total === 0) return null;

    const byLine = ingresos.reduce((acc, item) => {
      acc[item.linea_negocio] = (acc[item.linea_negocio] || 0) + (item.monto || 0);
      return acc;
    }, {});

    for (const [line, amount] of Object.entries(byLine)) {
      if ((amount / total) > 0.5) {
        return `Atención: La línea "${line}" representa más del 50% de los ingresos totales.`;
      }
    }
    return null;
  };

  const getMonthRange = (date = new Date()) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return {
      start: format(start, "yyyy-MM-dd 00:00:00"),
      end: format(end, "yyyy-MM-dd 23:59:59")
    };
  };

  const getPreviousMonthRange = (date = new Date()) => {
    const prevMonth = subMonths(date, 1);
    return getMonthRange(prevMonth);
  };

  const getWeekRange = (date = new Date()) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return {
      start: format(start, "yyyy-MM-dd 00:00:00"),
      end: format(end, "yyyy-MM-dd 23:59:59")
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return {
    calculateMonthlyMetrics,
    calculateBreakEven,
    calculateMeta2x,
    compareMonths,
    validateLineOfBusinessLimit,
    getMonthRange,
    getPreviousMonthRange,
    getWeekRange,
    formatCurrency
  };
};