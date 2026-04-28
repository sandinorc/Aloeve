import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Pencil, Trash2, Shield, AlertCircle, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import RoleFormModal from '@/components/RoleFormModal.jsx';

const PREDEFINED_ROLES = ['Admin', 'Fundadora', 'StudioManager', 'Vendedor', 'Empleado'];

export default function RolesManagementPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('roles').getList(1, 50, { 
        sort: 'nombre',
        $autoCancel: false 
      });
      setRoles(records.items);
    } catch (err) {
      console.error("Error al cargar roles:", err);
      setError("No se pudo cargar la lista de roles. Verifica tu conexión o permisos.");
      toast.error("Error al cargar roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreate = () => { 
    setSelectedRole(null); 
    setFormModalOpen(true); 
  };
  
  const openEdit = (role) => { 
    setSelectedRole(role); 
    setFormModalOpen(true); 
  };
  
  const openDelete = (role) => { 
    if (PREDEFINED_ROLES.includes(role.nombre)) {
      toast.error(`El rol predefinido "${role.nombre}" no puede ser eliminado.`);
      return;
    }
    setSelectedRole(role); 
    setDeleteModalOpen(true); 
  };

  const handleToggleStatus = async (role) => {
    try {
      await pb.collection('roles').update(role.id, { estado: !role.estado }, { $autoCancel: false });
      toast.success(`Rol ${!role.estado ? 'activado' : 'desactivado'} exitosamente`);
      fetchRoles();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error al cambiar el estado del rol');
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setIsDeleting(true);
    try {
      // Check if users are using this role
      const usersWithRole = await pb.collection('usuarios').getList(1, 1, {
        filter: `rol_id="${selectedRole.id}"`,
        $autoCancel: false
      });
      
      if (usersWithRole.totalItems > 0) {
        toast.error(`No se puede eliminar: Hay ${usersWithRole.totalItems} usuarios usando este rol.`);
        setDeleteModalOpen(false);
        return;
      }

      await pb.collection('roles').delete(selectedRole.id, { $autoCancel: false });
      toast.success('Rol eliminado exitosamente');
      setDeleteModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar el rol');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRoles = roles.filter(r => {
    const matchSearch = r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || 
                        (statusFilter === 'Activo' && r.estado) || 
                        (statusFilter === 'Inactivo' && !r.estado);
    return matchSearch && matchStatus;
  });

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Error de conexión</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
        <Button onClick={fetchRoles} className="bg-primary text-primary-foreground">
          <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight">Gestión de Roles</h1>
          <p className="text-muted-foreground text-sm mt-1">Administra los roles y permisos del sistema</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4 mr-2" /> Crear Rol
        </Button>
      </div>

      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row flex-wrap gap-4 bg-muted/10 border-b">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o descripción..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-input focus-visible:ring-primary"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
                <SelectValue placeholder="Filtrar por Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Descripción</TableHead>
                  <TableHead className="font-semibold text-center">Permisos</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[60px] mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-[120px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Shield className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No se encontraron roles</p>
                        {roles.length === 0 && (
                          <Button onClick={openCreate} variant="outline" className="mt-4">
                            Crear Primer Rol
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-medium text-foreground">
                        {item.nombre}
                        {PREDEFINED_ROLES.includes(item.nombre) && (
                          <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">Sistema</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {item.descripcion || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {item.permisos?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.estado ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className={`text-sm font-medium ${item.estado ? 'text-green-700' : 'text-gray-500'}`}>
                            {item.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar rol" className="hover:text-primary hover:bg-primary/10">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleStatus(item)} 
                            title={item.estado ? 'Desactivar' : 'Activar'} 
                            className={item.estado ? 'hover:text-orange-500 hover:bg-orange-50' : 'hover:text-green-600 hover:bg-green-50'}
                          >
                            {item.estado ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDelete(item)} 
                            title="Eliminar" 
                            className="hover:text-destructive hover:bg-destructive/10"
                            disabled={PREDEFINED_ROLES.includes(item.nombre)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RoleFormModal 
        isOpen={formModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        roleData={selectedRole} 
        onSuccess={fetchRoles} 
      />

      <Dialog open={deleteModalOpen} onOpenChange={(open) => !isDeleting && setDeleteModalOpen(open)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Eliminar Rol
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el rol <strong>{selectedRole?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}