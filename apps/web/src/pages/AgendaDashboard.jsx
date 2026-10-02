import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Users, DollarSign, Plus, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import pb from '@/lib/pocketbaseClient';
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import SessionForm from '@/components/SessionForm';

export default function AgendaDashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ sesionesSemana: 0, ocupacionPromedio: 0, ingresosSemana: 0, facilitadores: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startWeek = startOfWeek(today, { weekStartsOn: 1 });
      const endWeek = endOfWeek(today, { weekStartsOn: 1 });
      const next7Days = addDays(today, 7);

      const [sesiones, facilitadores] = await Promise.all([
        pb.collection('sesiones').getFullList({ sort: 'fecha,hora_inicio', $autoCancel: false }),
        pb.collection('facilitadores').getFullList({ filter: 'estado="Activo"', $autoCancel: false })
      ]);

      let sesSemana = 0;
      let ingSemana = 0;
      let totalOcupacion = 0;
      let sesionesConOcupacion = 0;
      const upcoming = [];
      const daysMap = { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0 };

      sesiones.forEach(s => {
        const sDate = new Date(s.fecha);
        
        // Stats for current week
        if (isWithinInterval(sDate, { start: startWeek, end: endWeek })) {
          sesSemana++;
          ingSemana += (s.ingresos_totales || 0);
          if (s.capacidad_maxima > 0) {
            totalOcupacion += ((s.asistentes_reales || 0) / s.capacidad_maxima) * 100;
            sesionesConOcupacion++;
          }
          const dayName = format(sDate, 'EEE', { locale: es });
          const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          if (daysMap[capitalizedDay] !== undefined) {
            daysMap[capitalizedDay]++;
          }
        }

        // Upcoming 7 days
        if (sDate >= today && sDate <= next7Days && upcoming.length < 5) {
          upcoming.push(s);
        }
      });

      setStats({
        sesionesSemana: sesSemana,
        ocupacionPromedio: sesionesConOcupacion > 0 ? Math.round(totalOcupacion / sesionesConOcupacion) : 0,
        ingresosSemana: ingSemana,
        facilitadores: facilitadores.length
      });

      setUpcomingSessions(upcoming);
      setChartData(Object.keys(daysMap).map(k => ({ name: k, sesiones: daysMap[k] })));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(val);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground font-serif">Resumen de Agenda</h2>
        <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-white shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" /> Nueva Sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Sesiones esta semana" value={stats.sesionesSemana} icon={CalendarIcon} color="text-primary" />
        <StatCard title="Ocupación Promedio" value={`${stats.ocupacionPromedio}%`} icon={Users} color="text-secondary" />
        <StatCard title="Ingresos Estimados" value={formatCurrency(stats.ingresosSemana)} icon={DollarSign} color="text-accent" />
        <StatCard title="Facilitadores Activos" value={stats.facilitadores} icon={Clock} color="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-lg">Sesiones por Día (Esta Semana)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sesiones" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.sesiones > 0 ? 'hsl(254, 68%, 57%)' : 'hsl(36, 20%, 85%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Próximas Sesiones</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('diaria')} className="text-xs text-primary">Ver calendario</Button>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingSessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay sesiones programadas próximamente.</p>
            ) : (
              <div className="divide-y">
                {upcomingSessions.map(s => (
                  <div key={s.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                    <div className="bg-primary/10 text-primary rounded-xl p-2 text-center min-w-[60px]">
                      <p className="text-xs font-bold uppercase">{format(new Date(s.fecha), 'MMM', { locale: es })}</p>
                      <p className="text-xl font-bold leading-none">{format(new Date(s.fecha), 'dd')}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.tipo}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {s.hora_inicio} - {s.facilitador}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SessionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />
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