import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, Package, Users, DollarSign, FileText, Loader2, MessageCircle, Edit2, Trash2, BookOpen, Plus } from 'lucide-react';
import apiClient from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Import new enrollment components
import ResumenInscripciones from './ResumenInscripciones';
import TablaInscripciones from './TablaInscripciones';
import ModalAsignarTalleres from './ModalAsignarTalleres';
import ModalEditarInscripcion from './ModalEditarInscripcion';
import ModalRegistroPago from './ModalRegistroPago';

export default function ClientDetail({ isOpen, onClose, client, onUpdate, onEdit }) {
  const [history, setHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);
  const [isEditarInscripcionOpen, setIsEditarInscripcionOpen] = useState(false);
  const [isPagoOpen, setIsPagoOpen] = useState(false);
  
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  const [selectedTallerForPayment, setSelectedTallerForPayment] = useState(null);

  useEffect(() => {
    if (isOpen && client?.id) {
      fetchDetails();
    }
  }, [isOpen, client]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [histData, refsData, inscData] = await Promise.all([
        apiClient.collection('historial_sesiones_cliente').getFullList(),
        apiClient.collection('clientes').getFullList(),
        apiClient.collection('inscripciones').getFullList()
      ]);
      
      // Local filtering since backend might not support PB filter syntax
      const filteredHist = histData.filter(h => h.cliente_id === client.id)
        .sort((a, b) => new Date(b.fecha_sesion) - new Date(a.fecha_sesion));
      
      const filteredRefs = refsData.filter(r => r.referido_por === client.nombre_completo);
      
      const filteredInsc = inscData.filter(i => i.clienteId === client.id)
        .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));

      setHistory(filteredHist);
      setReferrals(filteredRefs);
      setInscripciones(filteredInsc);
    } catch (error) {
      console.error('[ClientDetail] Error fetching details:', error);
      toast.error('Error al cargar los detalles del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return;
    try {
      await apiClient.collection('clientes').delete(client.id);
      toast.success("Cliente eliminado");
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('[ClientDetail] Error deleting client:', error);
      toast.error("Error al eliminar cliente");
    }
  };

  const handleWhatsApp = () => {
    const phone = client.whatsapp || client.telefono;
    if (!phone) return toast.error("No hay número registrado");
    const cleanPhone = phone.replace(/\D/g, '');
    toast.success(`Redirigiendo a WhatsApp: ${cleanPhone}`);
    window.open(`/redirect/whatsapp/${cleanPhone}`, '_blank');
  };

  // Inscripciones Handlers
  const handleEditInscripcion = (inscripcion) => {
    setSelectedInscripcion(inscripcion);
    setIsEditarInscripcionOpen(true);
  };

  const handleDeleteInscripcion = async (id) => {
    try {
      await apiClient.collection('inscripciones').delete(id);
      toast.success('Inscripción eliminada');
      fetchDetails();
    } catch (error) {
      console.error('[ClientDetail] Error deleting inscripcion:', error);
      toast.error('Error al eliminar la inscripción');
    }
  };

  const handlePaymentForInscripcion = (inscripcion) => {
    setSelectedTallerForPayment(inscripcion.tallerId);
    setIsPagoOpen(true);
  };

  if (!client) return null;

  const packageProgress = client.paquete_activo && client.sesiones_compradas > 0 
    ? (client.sesiones_usadas / client.sesiones_compradas) * 100 
    : 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4 shrink-0">
            <div className="flex justify-between items-start pr-6">
              <div>
                <DialogTitle className="text-2xl font-serif text-primary">{client.nombre_completo}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  {client.telefono} {client.email && `• ${client.email}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{client.segmento || 'Nuevo'}</Badge>
                <Badge variant={client.estado === 'Activo' ? 'default' : 'secondary'}>{client.estado}</Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex gap-2 py-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(client); }}>
              <Edit2 className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp} className="text-green-600 border-green-200 hover:bg-green-50">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive border-destructive/20 hover:bg-destructive/10 ml-auto">
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </Button>
          </div>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col mt-2">
            <TabsList className="grid grid-cols-6 w-full shrink-0">
              <TabsTrigger value="info"><User className="w-4 h-4 mr-2 hidden sm:block"/> Info</TabsTrigger>
              <TabsTrigger value="inscripciones"><BookOpen className="w-4 h-4 mr-2 hidden sm:block"/> Talleres</TabsTrigger>
              <TabsTrigger value="historial"><Calendar className="w-4 h-4 mr-2 hidden sm:block"/> Historial</TabsTrigger>
              <TabsTrigger value="paquete"><Package className="w-4 h-4 mr-2 hidden sm:block"/> Paquete</TabsTrigger>
              <TabsTrigger value="referidos"><Users className="w-4 h-4 mr-2 hidden sm:block"/> Referidos</TabsTrigger>
              <TabsTrigger value="pagos"><DollarSign className="w-4 h-4 mr-2 hidden sm:block"/> Pagos</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4 border rounded-xl p-4 bg-muted/5">
              <TabsContent value="info" className="m-0 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tipo de Cliente</p>
                    <p className="font-medium">{client.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fuente</p>
                    <p className="font-medium">{client.fuente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Primera Visita</p>
                    <p className="font-medium">{client.fecha_primera_visita ? format(new Date(client.fecha_primera_visita), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sesiones</p>
                    <p className="font-medium">{client.numero_sesiones || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Última Sesión</p>
                    <p className="font-medium">{client.ultima_sesion ? format(new Date(client.ultima_sesion), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Referido por</p>
                    <p className="font-medium">{client.referido_por || '-'}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Notas Internas</p>
                  <div className="bg-white p-4 rounded-lg border text-sm whitespace-pre-wrap min-h-[100px]">
                    {client.notas_internas || <span className="text-muted-foreground italic">Sin notas registradas.</span>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inscripciones" className="m-0 space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Gestión de Talleres</h3>
                  <Button onClick={() => setIsAsignarOpen(true)} size="sm" className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Asignar Taller
                  </Button>
                </div>
                
                <ResumenInscripciones inscripciones={inscripciones} />
                
                <TablaInscripciones 
                  inscripciones={inscripciones} 
                  isLoading={loading}
                  onEdit={handleEditInscripcion}
                  onDelete={handleDeleteInscripcion}
                  onPayment={handlePaymentForInscripcion}
                />
              </TabsContent>
              
              <TabsContent value="historial" className="m-0">
                {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo de Sesión</TableHead>
                        <TableHead>Asistencia</TableHead>
                        <TableHead>Pago</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No hay historial de sesiones.</TableCell></TableRow>
                      ) : (
                        history.map(h => (
                          <TableRow key={h.id}>
                            <TableCell>{format(new Date(h.fecha_sesion), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{h.tipo_sesion || h.expand?.sesion_id?.tipo || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={h.asistio ? 'bg-secondary/10 text-secondary border-secondary/20' : ''}>
                                {h.asistio ? 'Asistió' : 'No asistió'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={h.pago_confirmado ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                                {h.pago_confirmado ? 'Pagado' : 'Pendiente'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="paquete" className="m-0 space-y-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Estado del Paquete</h3>
                    <Badge variant={client.paquete_activo ? 'default' : 'secondary'}>
                      {client.paquete_activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  
                  {client.paquete_activo ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Sesiones Usadas: <strong>{client.sesiones_usadas || 0}</strong></span>
                        <span>Total Compradas: <strong>{client.sesiones_compradas || 0}</strong></span>
                      </div>
                      <Progress value={packageProgress} className="h-3" />
                      <p className="text-sm text-muted-foreground text-right">
                        Quedan {(client.sesiones_compradas || 0) - (client.sesiones_usadas || 0)} sesiones
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">El cliente no tiene un paquete activo actualmente.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="referidos" className="m-0">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Personas referidas por {client.nombre_completo}</h3>
                  <Badge variant="secondary">{referrals.length} referidos</Badge>
                </div>
                
                {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
                  <div className="space-y-2">
                    {referrals.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No ha referido a nadie aún.</p>
                    ) : (
                      referrals.map(r => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                          <div>
                            <p className="font-medium">{r.nombre_completo}</p>
                            <p className="text-xs text-muted-foreground">Primera visita: {r.fecha_primera_visita ? format(new Date(r.fecha_primera_visita), 'dd/MM/yyyy') : '-'}</p>
                          </div>
                          <Badge variant="outline">{r.numero_sesiones || 0} sesiones</Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pagos" className="m-0 space-y-6">
                <div className={`p-6 rounded-xl border ${client.pago_pendiente ? 'bg-destructive/5 border-destructive/20' : 'bg-secondary/5 border-secondary/20'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Estado de Cuenta</h3>
                      <p className="text-sm text-muted-foreground">
                        {client.pago_pendiente ? 'Tiene pagos pendientes' : 'Al día con sus pagos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Monto Pendiente</p>
                      <p className={`text-2xl font-bold ${client.pago_pendiente ? 'text-destructive' : 'text-secondary'}`}>
                        ${client.monto_pendiente || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modals for Enrollments */}
      <ModalAsignarTalleres 
        isOpen={isAsignarOpen}
        onClose={() => setIsAsignarOpen(false)}
        clienteId={client?.id}
        clienteNombre={client?.nombre_completo}
        onSuccess={fetchDetails}
      />

      <ModalEditarInscripcion 
        isOpen={isEditarInscripcionOpen}
        onClose={() => setIsEditarInscripcionOpen(false)}
        inscripcion={selectedInscripcion}
        onSuccess={fetchDetails}
      />

      <ModalRegistroPago 
        isOpen={isPagoOpen}
        onClose={() => setIsPagoOpen(false)}
        tipo="cliente"
        clienteId={client?.id}
        tallerId={selectedTallerForPayment}
        onPaymentSaved={() => {
          toast.success('Pago registrado exitosamente');
          fetchDetails();
        }}
      />
    </>
  );
}