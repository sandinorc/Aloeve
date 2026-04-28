import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Search, Save, Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const ROLES_AVAILABLE = ['Admin', 'Fundadora', 'StudioManager', 'Facilitador', 'Host', 'User'];

export default function PermissionsControl() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('usuarios').getList(1, 500, {
        sort: 'nombre_completo',
        $autoCancel: false
      });
      setUsers(records.items);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    const user = users.find(u => u.id === userId);
    if (user.rol === newRole) {
      // If changed back to original, remove from pending
      const updatedChanges = { ...pendingChanges };
      delete updatedChanges[userId];
      setPendingChanges(updatedChanges);
    } else {
      setPendingChanges({
        ...pendingChanges,
        [userId]: newRole
      });
    }
  };

  const handleSaveChanges = async () => {
    const userIdsToUpdate = Object.keys(pendingChanges);
    if (userIdsToUpdate.length === 0) return;

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of userIdsToUpdate) {
      try {
        const newRole = pendingChanges[userId];
        await pb.collection('usuarios').update(userId, { rol: newRole }, { $autoCancel: false });
        successCount++;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Se actualizaron los roles de ${successCount} usuario(s)`);
      setPendingChanges({});
      await fetchUsers(); // Refresh to get latest state
    }
    
    if (errorCount > 0) {
      toast.error(`Hubo un error al actualizar ${errorCount} usuario(s)`);
    }

    setSaving(false);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.nombre_completo && user.nombre_completo.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Gestión de Roles
          </CardTitle>
          <CardDescription>
            Asigna y modifica los niveles de acceso de los usuarios del sistema.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSaveChanges} 
            disabled={!hasChanges || saving}
            className="whitespace-nowrap transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
                {hasChanges && (
                  <span className="ml-2 bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {Object.keys(pendingChanges).length}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[30%] pl-6">Usuario</TableHead>
                <TableHead className="w-[35%]">Email</TableHead>
                <TableHead className="w-[35%] pr-6">Rol Asignado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-9 w-full max-w-[200px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const currentRole = pendingChanges[user.id] || user.rol || 'User';
                  const isChanged = !!pendingChanges[user.id];

                  return (
                    <TableRow key={user.id} className={isChanged ? "bg-primary/5" : ""}>
                      <TableCell className="font-medium pl-6">
                        {user.nombre_completo || 'Sin nombre'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="pr-6">
                        <Select
                          value={currentRole}
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                        >
                          <SelectTrigger className={`w-full max-w-[200px] ${isChanged ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES_AVAILABLE.map(role => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}