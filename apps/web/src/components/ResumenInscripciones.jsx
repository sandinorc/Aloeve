import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle2, PlayCircle, Clock, TrendingUp } from 'lucide-react';

export default function ResumenInscripciones({ inscripciones = [], variant = 'full' }) {
  
  useEffect(() => {
    if (!Array.isArray(inscripciones)) {
      console.error('[ResumenInscripciones] Error de validación: inscripciones debe ser un array. Recibido:', typeof inscripciones, inscripciones);
    }
  }, [inscripciones]);

  const safeInscripciones = Array.isArray(inscripciones) ? inscripciones : [];

  const stats = React.useMemo(() => {
    const total = safeInscripciones.length;
    const activos = safeInscripciones.filter(i => i.estado === 'activo').length;
    const completados = safeInscripciones.filter(i => i.estado === 'completado').length;
    const cancelados = safeInscripciones.filter(i => i.estado === 'cancelado').length;
    
    const totalHoras = safeInscripciones.reduce((sum, i) => sum + (Number(i.horasCompletadas) || 0), 0);
    
    let progresoPromedio = 0;
    const inscripcionesConProgreso = safeInscripciones.filter(i => i.estado === 'activo' || i.estado === 'completado');
    if (inscripcionesConProgreso.length > 0) {
      const sumaProgreso = inscripcionesConProgreso.reduce((sum, i) => sum + (Number(i.progreso) || 0), 0);
      progresoPromedio = Math.round(sumaProgreso / inscripcionesConProgreso.length);
    }

    return { total, activos, completados, cancelados, totalHoras, progresoPromedio };
  }, [safeInscripciones]);

  if (variant === 'mini') {
    return (
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1 text-primary">
          <PlayCircle className="w-4 h-4" />
          <span className="font-medium">{stats.activos} Activos</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium">{stats.completados} Completados</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Total Inscritos</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Activos</p>
            <h3 className="text-2xl font-bold text-primary">{stats.activos}</h3>
          </div>
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <PlayCircle className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Completados</p>
            <h3 className="text-2xl font-bold text-green-600">{stats.completados}</h3>
          </div>
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-orange-500">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Horas Completadas</p>
            <h3 className="text-2xl font-bold text-orange-600">{stats.totalHoras}</h3>
          </div>
          <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Progreso Promedio</p>
            <h3 className="text-2xl font-bold text-purple-600">{stats.progresoPromedio}%</h3>
          </div>
          <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}