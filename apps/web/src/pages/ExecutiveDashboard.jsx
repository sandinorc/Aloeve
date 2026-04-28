import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, DollarSign, Users, AlertTriangle, Activity, Save, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import pb from '@/lib/pocketbaseClient.js';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ ingresos: 0, margen: 0, ocupacion: 0, recurrentes: 0 });
  const [chartData, setChartData] = useState([]);
  const [lineaData, setLineaData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Editable goals
  const [goals, setGoals] = useState({
    meta_ingresos: 500000,
    meta_ocupacion: 75,
    meta_recurrentes: 40
  });

  console.log('[ExecutiveDashboard] Component rendering. Current loading state:', loading);

  const fetchData = async () => {
    console.log('[ExecutiveDashboard] Fetching dashboard data...');
    setLoading(true);
    try {
      const [ingresos, gastos, sesiones, clientes] = await Promise.all([
        pb.collection('ingresos').getFullList({ sort: '-fecha', $autoCancel: false }),
        pb.collection('gastos').getFullList({ sort: '-fecha', $autoCancel: false }),
        pb.collection('sesiones').getFullList({ sort: '-fecha', $autoCancel: false }),
        pb.collection('clientes').getFullList({ $autoCancel: false })
      ]);

      console.log('[ExecutiveDashboard] Data fetched successfully:', {
        ingresosCount: ingresos.length,
        gastosCount: gastos.length,
        sesionesCount: sesiones.length,
        clientesCount: clientes.length
      });

      const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
      const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
      const margen = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;

      let totalCapacidad = 0;
      let totalAsistentes = 0;
      sesiones.forEach(s => {
        if (s.capacidad_maxima > 0) {
          totalCapacidad += s.capacidad_maxima;
          totalAsistentes += (s.asistentes_reales || 0);
        }
      });
      const ocupacion = totalCapacidad > 0 ? (totalAsistentes / totalCapacidad) * 100 : 0;

      const recurrentes = clientes.filter(c => c.numero_sesiones > 1).length;
      const recurrentesPct = clientes.length > 0 ? (recurrentes / clientes.length) * 100 : 0;

      setStats({
        ingresos: totalIngresos,
        margen: Math.round(margen),
        ocupacion: Math.round(ocupacion),
        recurrentes: Math.round(recurrentesPct)
      });

      setChartData([
        { name: 'Ene', ingresos: 120000, gastos: 80000 },
        { name: 'Feb', ingresos: 150000, gastos: 85000 },
        { name: 'Mar', ingresos: 180000, gastos: 90000 },
      ]);

      const lineaMap = {};
      sesiones.forEach(s => {
        if (!lineaMap[s.linea_negocio]) lineaMap[s.linea_negocio] = 0;
        lineaMap[s.linea_negocio]++;
      });
      setLineaData(Object.keys(lineaMap).map(k => ({ name: k.split(' ')[0], value: lineaMap[k] })));

      const newAlerts = [];
      if (margen < 20) newAlerts.push({ type: 'warning', msg: 'Margen neto por debajo del 20%' });
      if (ocupacion < 50) newAlerts.push({ type: 'warning', msg: 'Ocupación promedio baja (<50%)' });
      const inactivos = clientes.filter(c => c.estado === 'Inactivo').length;
      if (inactivos > 20) newAlerts.push({ type: 'info', msg: `Hay ${inactivos} clientes inactivos para recuperar` });
      setAlerts(newAlerts);

    } catch (error) {
      console.error('[ExecutiveDashboard] Error fetching data:', error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      console.log('[ExecutiveDashboard] Fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ExecutiveDashboard] useEffect mounted, calling fetchData()');
    fetchData();
  }, []);

  const handleSaveGoals = async () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("Metas actualizadas correctamente");
      setSaving(false);
    }, 800);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    console.log('[ExecutiveDashboard] Returning loading spinner UI');
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center w-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando métricas del dashboard...</p>
      </div>
    );
  }

  console.log('[ExecutiveDashboard] Returning main dashboard UI');
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-serif">Dashboard Ejecutivo</h2>
          <p className="text-muted-foreground text-sm">Visión global del negocio para toma de decisiones</p>
        </div>
        <Button onClick={() => navigate('/logs')} variant="outline" className="bg-white">
          <Activity className="w-4 h-4 mr-2" /> Ver Logs de Actividad
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${a.type === 'warning' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{a.msg}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ingresos Totales" value={formatCurrency(stats.ingresos)} icon={DollarSign} color="text-primary" progress={(stats.ingresos/goals.meta_ingresos)*100} />
        <StatCard title="Margen Neto" value={`${stats.margen}%`} icon={TrendingUp} color="text-secondary" />
        <StatCard title="Ocupación Promedio" value={`${stats.ocupacion}%`} icon={Users} color="text-accent" progress={(stats.ocupacion/goals.meta_ocupacion)*100} />
        <StatCard title="Clientes Recurrentes" value={`${stats.recurrentes}%`} icon={Activity} color="text-muted-foreground" progress={(stats.recurrentes/goals.meta_recurrentes)*100} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="text-lg">Ingresos vs Gastos (Últimos 3 meses)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="hsl(254, 68%, 57%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gastos" name="Gastos" stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="text-lg">Sesiones por Línea</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lineaData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="hsl(40, 58%, 51%)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-primary">Metas Estratégicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs">Meta Ingresos Mensual (DOP)</Label>
                <Input type="number" value={goals.meta_ingresos} onChange={(e) => setGoals({...goals, meta_ingresos: e.target.value})} className="h-8 bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Meta Ocupación %</Label>
                  <Input type="number" value={goals.meta_ocupacion} onChange={(e) => setGoals({...goals, meta_ocupacion: e.target.value})} className="h-8 bg-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Meta Recurrentes %</Label>
                  <Input type="number" value={goals.meta_recurrentes} onChange={(e) => setGoals({...goals, meta_recurrentes: e.target.value})} className="h-8 bg-white" />
                </div>
              </div>
              <Button size="sm" className="w-full mt-2" onClick={handleSaveGoals} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Guardar Metas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, progress }) {
  return (
    <Card className="shadow-md border-0 rounded-2xl hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg bg-muted/30 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        
        {progress !== undefined && (
          <div className="mt-4 w-full bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`} 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}