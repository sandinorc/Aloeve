import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Edit, CalendarPlus, Mail, Phone, Award, Clock, Globe, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import FacilitadorFormModal from '@/components/FacilitadorFormModal';
import FacilitadorCalendarView from '@/components/FacilitadorCalendarView';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FacilitadorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facilitador, setFacilitador] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const facData = await pb.collection('facilitadores').getOne(id, { $autoCancel: false });
      setFacilitador(facData);

      const asigData = await pb.collection('asignaciones_talleres').getFullList({
        filter: `facilitador_id = "${id}" && estado = "activo"`,
        expand: 'taller_id',
        sort: 'taller_id.fecha',
        $autoCancel: false
      });
      setAsignaciones(asigData);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Error al cargar los detalles');
      navigate('/agenda/facilitadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDesasignar = async (asignacionId) => {
    if (!window.confirm('¿Está seguro de remover esta asignación?')) return;
    try {
      await pb.collection('asignaciones_talleres').delete(asignacionId, { $autoCancel: false });
      toast.success('Asignación removida');
      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Error al remover asignación');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!facilitador) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Helmet>
        <title>{`${facilitador.nombre} | Facilitadores`}</title>
      </Helmet>

      <div className="mb-6">
        <Link to="/agenda/facilitadores" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Facilitadores
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={facilitador.foto_url} alt={facilitador.nombre} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-serif">
                {facilitador.nombre.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-3">
                {facilitador.nombre}
                <Badge variant={facilitador.estado === 'Activo' ? 'default' : 'secondary'} 
                       className={facilitador.estado === 'Activo' ? 'bg-green-500' : ''}>
                  {facilitador.estado}
                </Badge>
              </h1>
              <p className="text-lg text-muted-foreground font-medium mt-1">{facilitador.especialidad || 'Facilitador General'}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="flex-1 md:flex-none">
              <Edit className="w-4 h-4 mr-2" /> Editar Perfil
            </Button>
            <Button onClick={() => navigate(`/agenda/facilitadores/${id}/asignar-talleres`)} className="flex-1 md:flex-none">
              <CalendarPlus className="w-4 h-4 mr-2" /> Asignar Taller
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${facilitador.email}`} className="hover:underline">{facilitador.email}</a>
              </div>
              {facilitador.telefono && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${facilitador.telefono}`} className="hover:underline">{facilitador.telefono}</a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span>{facilitador.experiencia_anos} años de experiencia</span>
              </div>
              {facilitador.idiomas && facilitador.idiomas.length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {facilitador.idiomas.map(i => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(facilitador.biografia || facilitador.certificaciones || facilitador.horario_disponible) && (
            <Card className="shadow-sm border-border/50">
              <CardContent className="pt-6 space-y-6">
                {facilitador.biografia && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Biografía</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{facilitador.biografia}</p>
                  </div>
                )}
                {facilitador.certificaciones && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Certificaciones</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{facilitador.certificaciones}</p>
                  </div>
                )}
                {facilitador.horario_disponible && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Disponibilidad
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{facilitador.horario_disponible}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Calendar & Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <FacilitadorCalendarView talleres={asignaciones} />

          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-serif">Próximos Talleres Asignados</CardTitle>
              <Badge variant="secondary">{asignaciones.length} asignaciones</Badge>
            </CardHeader>
            <CardContent>
              {asignaciones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay talleres asignados actualmente.</p>
                  <Button variant="link" onClick={() => navigate(`/agenda/facilitadores/${id}/asignar-talleres`)} className="mt-2">
                    Asignar un taller ahora
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Taller</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asignaciones.map((asig) => {
                        const taller = asig.expand?.taller_id;
                        if (!taller) return null;
                        
                        let formattedDate = taller.fecha;
                        try {
                          formattedDate = format(parseISO(taller.fecha.split(' ')[0]), 'dd MMM yyyy', { locale: es });
                        } catch(e) {}

                        return (
                          <TableRow key={asig.id}>
                            <TableCell className="font-medium whitespace-nowrap capitalize">{formattedDate}</TableCell>
                            <TableCell>
                              <div className="font-medium">{taller.title || taller.tipo}</div>
                              <div className="text-xs text-muted-foreground">{taller.linea_negocio}</div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {taller.hora_inicio} - {taller.hora_fin}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{taller.estado}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleDesasignar(asig.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4 mr-1" /> Remover
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FacilitadorFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        facilitador={facilitador}
        onSuccess={fetchData}
      />
    </div>
  );
}