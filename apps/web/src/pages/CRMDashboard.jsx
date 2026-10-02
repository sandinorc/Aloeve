import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import pb from '@/lib/pocketbaseClient';
import { motion } from 'framer-motion';
import ClientForm from '@/components/ClientForm';

export default function CRMDashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ total: 0, recurrentesPct: 0, retencion: 0, promedioSesiones: 0 });
  const [segmentData, setSegmentData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [inactiveAlerts, setInactiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const COLORS = ['#6B47DC', '#C9963A', '#1D9E75', '#E11D48', '#3B82F6'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const clients = await pb.collection('clientes').getFullList({ $autoCancel: false });
      
      let total = clients.length;
      let recurrentes = 0;
      let totalSesiones = 0;
      
      const segMap = { 'Nuevo': 0, 'Recurrente': 0, 'Fiel': 0, 'Inactivo': 0, 'VIP': 0 };
      const srcMap = { 'Plaza': 0, 'Digital': 0, 'Referido': 0, 'Otro': 0 };
      const alerts = [];
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      clients.forEach(c => {
        // Basic stats
        if (c.numero_sesiones > 1) recurrentes++;
        totalSesiones += (c.numero_sesiones || 0);

        // Segmentation logic (if not explicitly set)
        let segment = c.segmento;
        if (!segment) {
          if (c.tipo === 'Corporativo' || c.paquete_activo) segment = 'VIP';
          else if (c.ultima_sesion && new Date(c.ultima_sesion) < sixtyDaysAgo) segment = 'Inactivo';
          else if (c.numero_sesiones >= 5) segment = 'Fiel';
          else if (c.numero_sesiones >= 2) segment = 'Recurrente';
          else segment = 'Nuevo';
        }
        if (segMap[segment] !== undefined) segMap[segment]++;

        // Source
        if (srcMap[c.fuente] !== undefined) srcMap[c.fuente]++;

        // Alerts
        if (c.ultima_sesion && new Date(c.ultima_sesion) < sixtyDaysAgo && c.estado !== 'Inactivo') {
          alerts.push(c);
        }
      });

      setStats({
        total,
        recurrentesPct: total > 0 ? Math.round((recurrentes / total) * 100) : 0,
        retencion: 85, // Placeholder for complex calculation
        promedioSesiones: total > 0 ? (totalSesiones / total).toFixed(1) : 0
      });

      setSegmentData(Object.keys(segMap).map(k => ({ name: k, value: segMap[k] })).filter(d => d.value > 0));
      setSourceData(Object.keys(srcMap).map(k => ({ name: k, clientes: srcMap[k] })));
      setInactiveAlerts(alerts.slice(0, 5));

      // Mock growth data for last 3 months
      setGrowthData([
        { month: 'Ene', nuevos: 12, recurrentes: 45 },
        { month: 'Feb', nuevos: 19, recurrentes: 52 },
        { month: 'Mar', nuevos: 15, recurrentes: 58 },
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground font-serif">Dashboard CRM</h2>
        <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-white shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clientes" value={stats.total} icon={Users} color="text-primary" />
        <StatCard title="% Recurrentes" value={`${stats.recurrentesPct}%`} icon={UserCheck} color="text-secondary" />
        <StatCard title="Retención Mensual" value={`${stats.retencion}%`} icon={TrendingUp} color="text-accent" />
        <StatCard title="Sesiones Promedio" value={stats.promedioSesiones} icon={Users} color="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-lg">Distribución por Segmento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {segmentData.map((c, i) => (
                <div key={c.name} className="flex items-center text-xs font-medium">
                  <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  {c.name} ({c.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-lg">Clientes por Fuente</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="clientes" radius={[6, 6, 0, 0]} fill="hsl(40, 58%, 51%)" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-2xl flex flex-col">
          <CardHeader className="bg-destructive/5 border-b border-destructive/10 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Alertas de Inactividad
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('inactivos')} className="text-xs">Ver todos</Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {inactiveAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay alertas de inactividad.</p>
            ) : (
              <div className="divide-y">
                {inactiveAlerts.map(c => (
                  <div key={c.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <p className="font-semibold text-sm">{c.nombre_completo}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Última visita: {c.ultima_sesion ? new Date(c.ultima_sesion).toLocaleDateString() : 'Desconocida'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClientForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="shadow-md border-0 rounded-2xl hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-muted/30 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}