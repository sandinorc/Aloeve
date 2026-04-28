import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Wallet, Target, AlertTriangle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useFinanceCalculations } from '@/hooks/useFinanceCalculations';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FinancesDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalIngresos: 0, gastosFijos: 0, gastosVariables: 0, margen: 0 });
  const [prevMetrics, setPrevMetrics] = useState({ totalIngresos: 0, gastosFijos: 0, gastosVariables: 0, margen: 0 });
  const [chartData, setChartData] = useState([]);
  const [reservaCaja, setReservaCaja] = useState(0);
  const [reservaId, setReservaId] = useState(null);
  const [isEditingReserva, setIsEditingReserva] = useState(false);
  const [tempReserva, setTempReserva] = useState('');
  const [lineAlert, setLineAlert] = useState(null);

  const { 
    calculateMonthlyMetrics, 
    calculateBreakEven, 
    calculateMeta2x, 
    compareMonths,
    validateLineOfBusinessLimit,
    getMonthRange,
    getPreviousMonthRange,
    formatCurrency
  } = useFinanceCalculations();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const currentRange = getMonthRange();
      const prevRange = getPreviousMonthRange();

      // Fetch Current Month
      const currentIngresos = await pb.collection('ingresos').getFullList({
        filter: `fecha >= "${currentRange.start}" && fecha <= "${currentRange.end}"`,
        $autoCancel: false
      });
      const currentGastos = await pb.collection('gastos').getFullList({
        filter: `fecha >= "${currentRange.start}" && fecha <= "${currentRange.end}"`,
        $autoCancel: false
      });

      // Fetch Previous Month
      const prevIngresos = await pb.collection('ingresos').getFullList({
        filter: `fecha >= "${prevRange.start}" && fecha <= "${prevRange.end}"`,
        $autoCancel: false
      });
      const prevGastos = await pb.collection('gastos').getFullList({
        filter: `fecha >= "${prevRange.start}" && fecha <= "${prevRange.end}"`,
        $autoCancel: false
      });

      // Fetch Reserva
      const reservaRecords = await pb.collection('reserva_caja').getFullList({ $autoCancel: false });
      if (reservaRecords.length > 0) {
        setReservaCaja(reservaRecords[0].saldo_actual || 0);
        setReservaId(reservaRecords[0].id);
      }

      // Calculate Metrics
      const currentM = calculateMonthlyMetrics(currentIngresos, currentGastos);
      const prevM = calculateMonthlyMetrics(prevIngresos, prevGastos);
      
      setMetrics(currentM);
      setPrevMetrics(prevM);

      // Chart Data
      const lineas = currentIngresos.reduce((acc, item) => {
        const line = item.linea_negocio.split(' ')[0]; // Get L1, L2 etc
        acc[line] = (acc[line] || 0) + item.monto;
        return acc;
      }, {});
      
      const formattedChartData = Object.keys(lineas).map(key => ({
        name: key,
        total: lineas[key]
      })).sort((a, b) => b.total - a.total);
      
      setChartData(formattedChartData);
      setLineAlert(validateLineOfBusinessLimit(currentIngresos));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReserva = async () => {
    try {
      const val = parseFloat(tempReserva);
      if (isNaN(val)) throw new Error("Valor inválido");

      if (reservaId) {
        await pb.collection('reserva_caja').update(reservaId, { saldo_actual: val }, { $autoCancel: false });
      } else {
        const newRecord = await pb.collection('reserva_caja').create({ saldo_actual: val }, { $autoCancel: false });
        setReservaId(newRecord.id);
      }
      
      setReservaCaja(val);
      setIsEditingReserva(false);
      toast.success("Reserva de caja actualizada");
    } catch (error) {
      toast.error("Error al guardar la reserva");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const breakEvenPct = calculateBreakEven(metrics.gastosFijos, metrics.gastosVariables, metrics.totalIngresos);
  const meta2xPct = calculateMeta2x(metrics.gastosFijos, metrics.gastosVariables, metrics.totalIngresos);
  const comparisons = compareMonths(metrics, prevMetrics);

  const isLoss = metrics.totalIngresos < metrics.gastosFijos;
  const isLowReserve = reservaCaja < metrics.gastosFijos;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Alerts */}
      <div className="space-y-4">
        {isLoss && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Alerta Crítica</AlertTitle>
            <AlertDescription>
              Los ingresos actuales ({formatCurrency(metrics.totalIngresos)}) no cubren los gastos fijos ({formatCurrency(metrics.gastosFijos)}).
            </AlertDescription>
          </Alert>
        )}
        
        {isLowReserve && (
          <Alert className="bg-accent/10 border-accent/20 text-accent-foreground">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent font-semibold">Advertencia de Liquidez</AlertTitle>
            <AlertDescription>
              La reserva de caja ({formatCurrency(reservaCaja)}) es menor a 1 mes de gastos fijos ({formatCurrency(metrics.gastosFijos)}).
            </AlertDescription>
          </Alert>
        )}

        {lineAlert && (
          <Alert className="bg-secondary/10 border-secondary/20 text-secondary-foreground">
            <Target className="h-4 w-4 text-secondary" />
            <AlertTitle className="text-secondary font-semibold">Concentración de Ingresos</AlertTitle>
            <AlertDescription>{lineAlert}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Ingresos Totales" 
          amount={metrics.totalIngresos} 
          growth={comparisons.ingresosGrowth} 
          icon={TrendingUp}
          colorClass="text-primary"
        />
        <MetricCard 
          title="Gastos Fijos" 
          amount={metrics.gastosFijos} 
          icon={Wallet}
          colorClass="text-muted-foreground"
        />
        <MetricCard 
          title="Gastos Variables" 
          amount={metrics.gastosVariables} 
          icon={DollarSign}
          colorClass="text-muted-foreground"
        />
        <MetricCard 
          title="Margen Neto" 
          amount={metrics.margen} 
          growth={comparisons.margenGrowth} 
          icon={metrics.margen >= 0 ? TrendingUp : TrendingDown}
          colorClass={metrics.margen >= 0 ? "text-secondary" : "text-destructive"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xl font-semibold">Ingresos por Línea de Negocio</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(254, 68%, 57%)' : 'hsl(161, 69%, 36%)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de ingresos este mes
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goals & Reserve */}
        <div className="space-y-8">
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg font-semibold">Metas del Mes</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Punto de Equilibrio</span>
                  <span className={breakEvenPct >= 100 ? "text-secondary" : "text-primary"}>{breakEvenPct}%</span>
                </div>
                <Progress value={breakEvenPct} className="h-2" indicatorColor={breakEvenPct >= 100 ? "bg-secondary" : "bg-primary"} />
                <p className="text-xs text-muted-foreground text-right">
                  Meta: {formatCurrency(metrics.gastosFijos + metrics.gastosVariables)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Meta 2× Gastos</span>
                  <span className={meta2xPct >= 100 ? "text-accent" : "text-muted-foreground"}>{meta2xPct}%</span>
                </div>
                <Progress value={meta2xPct} className="h-2" indicatorColor="bg-accent" />
                <p className="text-xs text-muted-foreground text-right">
                  Meta: {formatCurrency((metrics.gastosFijos + metrics.gastosVariables) * 2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Reserva de Caja
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingReserva ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    type="number" 
                    value={tempReserva} 
                    onChange={(e) => setTempReserva(e.target.value)}
                    className="bg-white"
                    placeholder="Monto en DOP"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveReserva}>Guardar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingReserva(false)}>Cancelar</Button>
                </div>
              ) : (
                <div className="flex items-end justify-between mt-2">
                  <span className="text-3xl font-bold text-primary">{formatCurrency(reservaCaja)}</span>
                  <Button variant="link" size="sm" className="text-primary hover:bg-primary/10" onClick={() => {
                    setTempReserva(reservaCaja.toString());
                    setIsEditingReserva(true);
                  }}>
                    Editar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, amount, growth, icon: Icon, colorClass }) {
  const { formatCurrency } = useFinanceCalculations();
  
  return (
    <Card className="shadow-md border-0 rounded-2xl hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${colorClass}`}>{formatCurrency(amount)}</p>
          </div>
          <div className={`p-3 rounded-xl bg-muted/50 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {growth !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn("font-medium flex items-center", growth >= 0 ? "text-secondary" : "text-destructive")}>
              {growth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(growth)}%
            </span>
            <span className="text-muted-foreground ml-2">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}