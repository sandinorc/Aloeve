import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Pencil, KeyRound, ToggleLeft, ToggleRight, Trash2, Users, AlertCircle, RefreshCw, Eye, UserCog } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Modals
import UserFormModal from '@/components/UserFormModal.jsx';
import ResetPasswordModal from '@/components/ResetPasswordModal.jsx';
import ToggleUserStatusModal from '@/components/ToggleUserStatusModal.jsx';
import DeleteUserModal from '@/components/DeleteUserModal.jsx';
import UserDetailsModal from '@/components/UserDetailsModal.jsx';
import ChangeRoleModal from '@/components/ChangeRoleModal.jsx';

export default function UsersManagementPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        pb.collection('usuarios').getFullList({ 
          sort: '-fecha_creacion',
          expand: 'rol_id',
          $autoCancel: false 
        }),
        pb.collection('roles').getFullList({
          filter: 'estado=true',
          sort: 'nombre',
          $autoCancel: false
        })
      ]);
      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudo cargar la lista de usuarios. Verifica tu conexión o permisos.");
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers for opening modals
  const openCreate = () => { setSelectedUser(null); setFormModalOpen(true); };
  const openEdit = (user) => { setSelectedUser(user); setFormModalOpen(true); };
  const openReset = (user) => { setSelectedUser(user); setResetModalOpen(true); };
  const openToggle = (user) => { setSelectedUser(user); setToggleModalOpen(true); };
  const openDelete = (user) => { setSelectedUser(user); setDeleteModalOpen(true); };
  const openDetails = (user) => { setSelectedUser(user); setDetailsModalOpen(true); };
  const openRole = (user) => { setSelectedUser(user); setRoleModalOpen(true); };

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const matchSearch = u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.rol_id === roleFilter;
    const matchStatus = statusFilter === 'all' || u.estado === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const getRoleName = (user) => {
    if (user.expand?.rol_id?.nombre) return user.expand.rol_id.nombre;
    return user.rol || 'Sin Rol';
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Error de conexión</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
        <Button onClick={fetchData} className="bg-primary text-primary-foreground">
          <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Administra los accesos, roles y permisos del sistema</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4 mr-2" /> Crear Usuario
        </Button>
      </div>

      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-0">
          {/* Filters Bar */}
          <div className="p-4 flex flex-col sm:flex-row flex-wrap gap-4 bg-muted/10 border-b">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o email..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-input focus-visible:ring-primary"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
                <SelectValue placeholder="Filtrar por Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background border-input">
                <SelectValue placeholder="Filtrar por Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold">Nombre y Email</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Fecha Creación</TableHead>
                  <TableHead className="text-right font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-[180px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No se encontraron usuarios</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda o verifica la base de datos.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell>
                        <div className="font-medium text-foreground">{item.nombre_completo}</div>
                        <div className="text-sm text-muted-foreground">{item.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {getRoleName(item)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className={`text-sm font-medium ${item.estado === 'Activo' ? 'text-green-700' : 'text-gray-500'}`}>
                            {item.estado}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.fecha_creacion ? format(new Date(item.fecha_creacion), 'dd MMM yyyy', { locale: es }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => openDetails(item)} title="Ver detalles" className="hover:text-primary hover:bg-primary/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar usuario" className="hover:text-primary hover:bg-primary/10">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openRole(item)} title="Cambiar rol" className="hover:text-primary hover:bg-primary/10" disabled={item.id === currentUser?.id}>
                            <UserCog className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openToggle(item)} 
                            title={item.estado === 'Activo' ? 'Desactivar' : 'Activar'} 
                            className={item.estado === 'Activo' ? 'hover:text-orange-500 hover:bg-orange-50' : 'hover:text-green-600 hover:bg-green-50'}
                            disabled={item.id === currentUser?.id}
                          >
                            {item.estado === 'Activo' ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDelete(item)} 
                            title="Eliminar" 
                            className="hover:text-destructive hover:bg-destructive/10"
                            disabled={item.id === currentUser?.id}
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

      {/* Modals */}
      <UserFormModal 
        isOpen={formModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        user={selectedUser} 
        onSuccess={fetchData} 
        availableRoles={roles}
      />
      
      <ResetPasswordModal 
        isOpen={resetModalOpen} 
        onClose={() => setResetModalOpen(false)} 
        user={selectedUser} 
      />
      
      <ToggleUserStatusModal 
        isOpen={toggleModalOpen} 
        onClose={() => setToggleModalOpen(false)} 
        user={selectedUser} 
        onSuccess={fetchData} 
      />
      
      <DeleteUserModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        user={selectedUser} 
        onSuccess={fetchData} 
      />

      <UserDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        user={selectedUser}
        currentUser={currentUser}
        onEdit={openEdit}
        onChangeRole={openRole}
        onResetPassword={openReset}
        onToggleStatus={openToggle}
        onDelete={openDelete}
      />

      <ChangeRoleModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        user={selectedUser}
        onSuccess={fetchData}
        availableRoles={roles}
      />
    </motion.div>
  );
}