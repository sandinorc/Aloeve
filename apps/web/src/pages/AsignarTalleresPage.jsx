import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, CalendarPlus, Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AsignarTalleresPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [facilitador, setFacilitador] = useState(null);
  const [talleres, setTalleres] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [validatingId, setValidatingId] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const facData = await pb.collection('facilitadores').getOne(id, { $autoCancel: false });
      setFacilitador(facData);

      // Get current assignments to filter them out
      const asigData = await pb.collection('asignaciones_talleres').getFullList({
        filter: `facilitador_id = "${id}" && estado = "activo"`,
        $autoCancel: false
      });
      setAsignaciones(asigData.map(a => a.taller_id));

      // Get upcoming sessions (not cancelled)
      const today = new Date().toISOString().split('T')[0];
      const sesionesData = await pb.collection('sesiones').getFullList({
        filter: `fecha >= "${today}" && estado != "Cancelada"`,
        sort: 'fecha,hora_inicio',
        $autoCancel: false
      });
      
      setTalleres(sesionesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAssign = async (taller) => {
    setValidatingId(taller.id);
    setConflictError(null);

    try {
      // Ensure we have a valid token before making the request
      if (!pb.authStore.isValid || !pb.authStore.token) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }

      const fechaTaller = taller.fecha.split(' ')[0];

      // 1. Validate conflict via backend API
      const response = await apiServerClient.fetch('/validar-conflicto-horario', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          facilitadorId: id,
          tallerIds: [taller.id],
          fechaInicio: fechaTaller,
          fechaFin: fechaTaller
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error en la validación del servidor');
      }

      const validationData = await response.json();

      if (validationData.conflictos && validationData.conflictos.length > 0) {
        setConflictError({
          tallerId: taller.id,
          message: "Conflicto de horario detectado",
          details: validationData.conflictos[0]
        });
        setValidatingId(null);
        return;
      }

      // 2. If no conflict, create assignment
      await pb.collection('asignaciones_talleres').create({
        facilitador_id: id,
        taller_id: taller.id,
        estado: 'activo'
      }, { $autoCancel: false });

      toast.success('Taller asignado exitosamente');
      
      // Update local state to remove from available list
      setAsignaciones(prev => [...prev, taller.id]);
      
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.message || 'Error al asignar el taller');
    } finally {
      setValidatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableTalleres = talleres.filter(t => !asignaciones.includes(t.id));
  
  const filteredTalleres = availableTalleres.filter(t => {
    const searchStr = `${t.title || ''} ${t.tipo || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Helmet>
        <title>Asignar Talleres | Aloeve Studio</title>
      </Helmet>

      <div className="mb-6">
        <Link to={`/agenda/facilitadores/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Perfil
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary">Asignar Talleres</h1>
          <p className="text-muted-foreground mt-1">
            Seleccione los talleres disponibles para <span className="font-semibold text-foreground">{facilitador?.nombre}</span>
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar talleres por nombre o tipo..." 
            className="pl-9 max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTalleres.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed">
            <CalendarPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">No hay talleres disponibles</h3>
            <p className="text-muted-foreground mt-1">Todos los talleres futuros ya están asignados o no coinciden con la búsqueda.</p>
          </div>
        ) : (
          filteredTalleres.map(taller => {
            let formattedDate = taller.fecha;
            try {
              formattedDate = format(parseISO(taller.fecha.split(' ')[0]), 'EEEE, d de MMMM yyyy', { locale: es });
            } catch(e) {}

            const isConflict = conflictError?.tallerId === taller.id;

            return (
              <Card key={taller.id} className={`overflow-hidden transition-all ${isConflict ? 'border-destructive ring-1 ring-destructive/20' : 'hover:shadow-md'}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">{formattedDate}</Badge>
                        <Badge variant="secondary" className="font-mono">{taller.hora_inicio} - {taller.hora_fin}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{taller.title || taller.tipo}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                        <span>Línea: {taller.linea_negocio}</span>
                        <span>•</span>
                        <span>Capacidad: {taller.capacidad_maxima} pax</span>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col items-end gap-2">
                      <Button 
                        onClick={() => handleAssign(taller)} 
                        disabled={validatingId === taller.id}
                        className="w-full md:w-auto"
                      >
                        {validatingId === taller.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validando...</>
                        ) : (
                          <><CalendarPlus className="w-4 h-4 mr-2" /> Asignar a Facilitador</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {isConflict && (
                    <div className="px-5 pb-5 pt-0">
                      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Conflicto de Horario Detectado</AlertTitle>
                        <AlertDescription className="mt-2">
                          <p>{conflictError.message}</p>
                          {conflictError.details && (
                            <div className="mt-2 text-sm bg-background/50 p-2 rounded border border-destructive/10">
                              <strong>Taller conflictivo:</strong> {conflictError.details.tallerNombre || conflictError.details.nombre} <br/>
                              <strong>Fecha:</strong> {conflictError.details.fecha} <br/>
                              <strong>Horario:</strong> {conflictError.details.horario || `${conflictError.details.hora_inicio} - ${conflictError.details.hora_fin}`}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}