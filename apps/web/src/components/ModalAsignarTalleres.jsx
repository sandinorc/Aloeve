import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, Calendar } from 'lucide-react';
import apiClient from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ModalAsignarTalleres({ isOpen, onClose, clienteId, clienteNombre, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [talleres, setTalleres] = useState([]);
  const [inscripcionesExistentes, setInscripcionesExistentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTalleres, setSelectedTalleres] = useState([]);
  
  const [commonData, setCommonData] = useState({
    fechaInicio: '',
    notas: ''
  });

  useEffect(() => {
    if (isOpen && clienteId) {
      fetchData();
      setSelectedTalleres([]);
      setSearchTerm('');
      setCommonData({ fechaInicio: '', notas: '' });
    }
  }, [isOpen, clienteId]);

  const fetchData = async () => {
    if (!clienteId) {
      console.error('[ModalAsignarTalleres] Error de validación: clienteId es requerido para fetchData');
      toast.error('Error interno: ID de cliente no proporcionado');
      return;
    }

    console.log(`[ModalAsignarTalleres] Iniciando fetchData para clienteId: ${clienteId}`);
    setFetching(true);
    try {
      const [talleresData, inscripcionesData] = await Promise.all([
        apiClient.collection('talleres').getFullList(),
        apiClient.collection('inscripciones').getFullList()
      ]);
      
      // Local filtering and sorting
      const sortedTalleres = talleresData.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
      const filteredInscripciones = inscripcionesData.filter(i => i.clienteId === clienteId);

      console.log('[ModalAsignarTalleres] Éxito talleres obtenidos:', sortedTalleres.length);
      console.log('[ModalAsignarTalleres] Éxito inscripciones obtenidas:', filteredInscripciones.length);

      setTalleres(sortedTalleres);
      setInscripcionesExistentes(filteredInscripciones.map(i => i.tallerId));
    } catch (err) {
      console.error('[ModalAsignarTalleres] ERROR en fetchData:', err);
      toast.error('Error al cargar los talleres disponibles. Revise la consola.');
    } finally {
      setFetching(false);
    }
  };

  const handleToggleTaller = (tallerId) => {
    setSelectedTalleres(prev => 
      prev.includes(tallerId) 
        ? prev.filter(id => id !== tallerId)
        : [...prev, tallerId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clienteId) {
      console.error('[ModalAsignarTalleres] Error de validación: clienteId es requerido en handleSubmit');
      toast.error('Error interno: ID de cliente no proporcionado');
      return;
    }

    if (selectedTalleres.length === 0) {
      toast.error('Debe seleccionar al menos un taller');
      return;
    }

    console.log(`[ModalAsignarTalleres] Iniciando handleSubmit para ${selectedTalleres.length} talleres`);
    setLoading(true);
    try {
      const promises = selectedTalleres.map(tallerId => {
        if (!tallerId) {
          throw new Error('tallerId es requerido para crear inscripción');
        }

        const payload = {
          clienteId,
          tallerId,
          estado: 'activo',
          fechaInicio: commonData.fechaInicio || null,
          horasCompletadas: 0,
          horasTotales: 0,
          progreso: 0,
          notas: commonData.notas
        };

        console.log(`[ModalAsignarTalleres] apiClient.collection("inscripciones").create(`, payload, `)`);
        return apiClient.collection('inscripciones').create(payload);
      });

      const results = await Promise.all(promises);
      console.log('[ModalAsignarTalleres] Éxito al crear inscripciones:', results);
      
      toast.success(`Se han registrado ${selectedTalleres.length} inscripciones exitosamente`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[ModalAsignarTalleres] ERROR en handleSubmit:', err);
      toast.error('Error al procesar las inscripciones. Revise la consola.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTalleres = talleres.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.descripcion && t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asignar Talleres</DialogTitle>
          <DialogDescription>
            Inscribir a <span className="font-semibold text-foreground">{clienteNombre}</span> en nuevos talleres o cursos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-2">
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio (Opcional)</Label>
                <Input 
                  id="fechaInicio" 
                  type="date" 
                  value={commonData.fechaInicio} 
                  onChange={(e) => setCommonData(prev => ({...prev, fechaInicio: e.target.value}))}
                  className="text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas Generales</Label>
                <Input 
                  id="notas" 
                  placeholder="Ej. Requiere material especial..." 
                  value={commonData.notas} 
                  onChange={(e) => setCommonData(prev => ({...prev, notas: e.target.value}))}
                  className="text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
              <Label>Seleccionar Talleres</Label>
              <div className="relative shrink-0 mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar taller por nombre..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="border rounded-md flex-1 overflow-hidden bg-muted/10">
                {fetching ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] p-4">
                    {filteredTalleres.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No se encontraron talleres.</p>
                    ) : (
                      <div className="space-y-3">
                        {filteredTalleres.map(taller => {
                          const isAlreadyEnrolled = inscripcionesExistentes.includes(taller.id);
                          return (
                            <div 
                              key={taller.id} 
                              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                isAlreadyEnrolled ? 'bg-muted/50 opacity-60' : 
                                selectedTalleres.includes(taller.id) ? 'bg-primary/5 border-primary/30' : 'bg-card hover:bg-muted/30'
                              }`}
                            >
                              <Checkbox 
                                id={`taller-${taller.id}`} 
                                checked={selectedTalleres.includes(taller.id) || isAlreadyEnrolled}
                                disabled={isAlreadyEnrolled}
                                onCheckedChange={() => handleToggleTaller(taller.id)}
                                className="mt-1"
                              />
                              <div className="grid gap-1.5 leading-none flex-1">
                                <label 
                                  htmlFor={`taller-${taller.id}`}
                                  className={`text-sm font-medium leading-none ${isAlreadyEnrolled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  {taller.nombre}
                                  {isAlreadyEnrolled && <span className="ml-2 text-xs text-orange-600 font-normal">(Ya inscrito)</span>}
                                </label>
                                <div className="flex items-center text-xs text-muted-foreground gap-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {taller.fecha ? format(new Date(taller.fecha), 'dd/MM/yyyy') : 'Sin fecha'}
                                  </span>
                                  <span>{taller.hora_inicio} - {taller.hora_fin}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-right shrink-0">
                {selectedTalleres.length} taller(es) seleccionado(s)
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 shrink-0 mt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || selectedTalleres.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Inscripción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}