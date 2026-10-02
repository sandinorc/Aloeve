
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Plus, Search, Edit, Eye, Trash2, CalendarPlus, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import pb from '@/lib/pocketbaseClient';
import FacilitadorFormModal from '@/components/FacilitadorFormModal';
import PaymentManagementModal from '@/components/PaymentManagementModal';
import { toast } from 'sonner';

export default function FacilitatoresPage() {
  const navigate = useNavigate();
  const [facilitadores, setFacilitadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [selectedFacilitador, setSelectedFacilitador] = useState(null);

  const fetchFacilitadores = async () => {
    setLoading(true);
    try {
      const user = pb.authStore.model;
      const isAdmin = user?.rol === 'Admin' || user?.rol === 'Fundadora' || user?.role === 'Admin' || user?.role === 'Fundadora';
      const studioId = user?.studioId || user?.studio_id || user?.estudio_id;
      
      if (!isAdmin && !studioId) {
        toast.error('Tu cuenta no tiene un estudio asignado para ver facilitadores');
        setLoading(false);
        return;
      }

      const options = {
        sort: '-created',
        $autoCancel: false
      };

      if (!isAdmin && studioId) {
        options.filter = `studioId = "${studioId}"`;
      }

      const records = await pb.collection('facilitadores').getFullList(options);
      
      // Fetch assignment counts for each
      const assignments = await pb.collection('asignaciones_talleres').getFullList({
        filter: 'estado = "activo"',
        $autoCancel: false
      });
      
      const counts = assignments.reduce((acc, curr) => {
        acc[curr.facilitador_id] = (acc[curr.facilitador_id] || 0) + 1;
        return acc;
      }, {});

      const enriched = records.map(f => ({
        ...f,
        talleres_asignados: counts[f.id] || 0
      }));

      setFacilitadores(enriched);
    } catch (error) {
      console.error('Error fetching facilitadores:', error);
      toast.error('Error al cargar facilitadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilitadores();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este facilitador?')) return;
    try {
      await pb.collection('facilitadores').delete(id, { $autoCancel: false });
      toast.success('Facilitador eliminado');
      fetchFacilitadores();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const openEditModal = (facilitador) => {
    setSelectedFacilitador(facilitador);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedFacilitador(null);
    setIsModalOpen(true);
  };

  const openPaymentsModal = (facilitador) => {
    setSelectedFacilitador(facilitador);
    setIsPaymentsOpen(true);
  };

  const filteredData = facilitadores.filter(f => {
    const matchesSearch = (f.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (f.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (f.especialidad?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.estado === statusFilter;
    const matchesSpecialty = specialtyFilter === 'all' || f.especialidad === specialtyFilter;
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const specialties = [...new Set(facilitadores.map(f => f.especialidad).filter(Boolean))];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Helmet>
        <title>Facilitadores | Aloeve Studio</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary">Directorio de Facilitadores</h1>
          <p className="text-muted-foreground mt-1">Gestione los instructores y sus asignaciones</p>
        </div>
        <Button onClick={openCreateModal} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Agregar Facilitador
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, email o especialidad..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            {specialties.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Activo">Activos</SelectItem>
            <SelectItem value="Inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No se encontraron facilitadores</h3>
            <p className="text-muted-foreground mt-1">Intente ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Facilitador</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-center">Talleres</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((f) => (
                  <TableRow key={f.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={f.foto_url} alt={f.nombre} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {f.nombre.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{f.nombre}</div>
                          <div className="text-xs text-muted-foreground">{f.experiencia_anos} años exp.</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background">
                        {f.especialidad || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{f.email}</div>
                      <div className="text-xs text-muted-foreground">{f.telefono}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {f.talleres_asignados}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={f.estado === 'Activo' ? 'default' : 'secondary'} 
                             className={f.estado === 'Activo' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {f.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openPaymentsModal(f)} title="Gestionar Pagos">
                          <Wallet className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/agenda/facilitadores/${f.id}`)} title="Ver detalles">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/agenda/facilitadores/${f.id}/asignar-talleres`)} title="Asignar talleres">
                          <CalendarPlus className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(f)} title="Editar">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} title="Eliminar">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <FacilitadorFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        facilitador={selectedFacilitador}
        onSuccess={fetchFacilitadores}
      />

      {selectedFacilitador && (
        <PaymentManagementModal 
          isOpen={isPaymentsOpen}
          onClose={() => setIsPaymentsOpen(false)}
          entityType="facilitador"
          entityId={selectedFacilitador.id}
          entityName={selectedFacilitador.nombre}
        />
      )}
    </div>
  );
}
