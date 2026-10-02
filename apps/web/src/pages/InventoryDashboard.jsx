import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, DollarSign, TrendingUp, Plus, ArrowRightLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import pb from '@/lib/pocketbaseClient';
import { motion } from 'framer-motion';
import MaterialForm from '@/components/MaterialForm';

export default function InventoryDashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ totalItems: 0, totalStock: 0, totalValue: 0, alerts: 0 });
  const [topMaterials, setTopMaterials] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [alertItems, setAlertItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const COLORS = ['#6B47DC', '#1D9E75', '#C9963A', '#E11D48', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const materials = await pb.collection('materiales').getFullList({ $autoCancel: false });
      
      let tStock = 0;
      let tValue = 0;
      let alertsCount = 0;
      const alertsList = [];
      const catMap = {};

      materials.forEach(m => {
        tStock += m.cantidad_actual;
        const val = m.cantidad_actual * m.precio_unitario;
        tValue += val;
        m.valor_total = val;

        if (m.cantidad_actual < m.cantidad_minima) {
          alertsCount++;
          alertsList.push(m);
        } else if (m.cantidad_actual < m.cantidad_minima * 1.2) {
          alertsList.push(m);
        }

        catMap[m.categoria] = (catMap[m.categoria] || 0) + 1;
      });

      setStats({
        totalItems: materials.length,
        totalStock: tStock,
        totalValue: tValue,
        alerts: alertsCount
      });

      setTopMaterials(materials.sort((a, b) => b.valor_total - a.valor_total).slice(0, 10));
      setAlertItems(alertsList.sort((a, b) => (a.cantidad_actual / a.cantidad_minima) - (b.cantidad_actual / b.cantidad_minima)));
      
      setCategoryData(Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })));

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
        <h2 className="text-2xl font-bold text-foreground">Resumen de Inventario</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Material
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('movimientos')}>
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Registrar Movimiento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Materiales" value={stats.totalItems} icon={Package} color="text-primary" />
        <StatCard title="Stock Total (Unidades)" value={Math.round(stats.totalStock)} icon={TrendingUp} color="text-secondary" />
        <StatCard title="Valor Total" value={formatCurrency(stats.totalValue)} icon={DollarSign} color="text-accent" />
        <StatCard title="Alertas de Stock" value={stats.alerts} icon={AlertTriangle} color="text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-md border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Materiales por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMaterials} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} />
                  <YAxis dataKey="nombre" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="valor_total" radius={[0, 4, 4, 0]} fill="hsl(254, 68%, 57%)" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  {c.name} ({c.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-md border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Materiales con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay alertas de stock.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertItems.map(item => {
                  const isCritical = item.cantidad_actual < item.cantidad_minima;
                  return (
                    <div key={item.id} className={`p-4 rounded-xl border ${isCritical ? 'bg-destructive/10 border-destructive/20' : 'bg-accent/10 border-accent/20'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm truncate pr-2">{item.nombre}</h4>
                        <span className="text-xs font-mono text-muted-foreground">{item.codigo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual: <strong className={isCritical ? 'text-destructive' : 'text-accent-foreground'}>{item.cantidad_actual}</strong></span>
                        <span className="text-muted-foreground">Mínimo: {item.cantidad_minima}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MaterialForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="shadow-sm border-0 rounded-2xl">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}