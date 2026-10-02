
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ESPECIALIDADES = ['Yoga', 'Pilates', 'Meditación', 'Fitness', 'Danza', 'Artes', 'Otro'];
const IDIOMAS_DISPONIBLES = ['Español', 'Inglés', 'Francés', 'Portugués'];

export default function FacilitadorFormModal({ isOpen, onClose, facilitador, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    biografia: '',
    foto_url: '',
    estado: 'Activo',
    experiencia_anos: 0,
    certificaciones: '',
    idiomas: [],
    horario_disponible: ''
  });

  useEffect(() => {
    if (facilitador) {
      setFormData({
        nombre: facilitador.nombre || '',
        email: facilitador.email || '',
        telefono: facilitador.telefono || '',
        especialidad: facilitador.especialidad || '',
        biografia: facilitador.biografia || '',
        foto_url: facilitador.foto_url || '',
        estado: facilitador.estado || 'Activo',
        experiencia_anos: facilitador.experiencia_anos || 0,
        certificaciones: facilitador.certificaciones || '',
        idiomas: facilitador.idiomas || [],
        horario_disponible: facilitador.horario_disponible || ''
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        especialidad: '',
        biografia: '',
        foto_url: '',
        estado: 'Activo',
        experiencia_anos: 0,
        certificaciones: '',
        idiomas: [],
        horario_disponible: ''
      });
    }
  }, [facilitador, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIdiomaToggle = (idioma) => {
    setFormData(prev => {
      const current = prev.idiomas || [];
      if (current.includes(idioma)) {
        return { ...prev, idiomas: current.filter(i => i !== idioma) };
      } else {
        return { ...prev, idiomas: [...current, idioma] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = pb.authStore.model;
      
      const isAdmin = user?.rol === 'Admin' || user?.rol === 'Fundadora' || user?.role === 'Admin' || user?.role === 'Fundadora';
      const studioId = user?.studioId || user?.studio_id || user?.studio || user?.estudio_id || user?.estudio;

      if (!isAdmin && !studioId) {
        console.error('ERROR: No se encontró un ID de estudio en el usuario no administrador.', user);
        toast.error('Tu cuenta no tiene un estudio asignado. Por favor, contacta al administrador para configurar tu cuenta correctamente.');
        setLoading(false);
        return;
      }

      // Check email uniqueness if creating or changing email
      if (!facilitador || facilitador.email !== formData.email) {
        const existing = await pb.collection('facilitadores').getList(1, 1, {
          filter: `email = "${formData.email}"`,
          $autoCancel: false
        });
        if (existing.items.length > 0) {
          toast.error('El email ya está registrado para otro facilitador.');
          setLoading(false);
          return;
        }
      }

      const dataToSave = {
        ...formData,
        experiencia_anos: parseInt(formData.experiencia_anos) || 0,
      };

      if (studioId) {
        dataToSave.studioId = studioId;
      } else if (isAdmin && facilitador?.studioId) {
        // Prevent clearing studioId if admin edits an existing facilitator that has one
        dataToSave.studioId = facilitador.studioId;
      }

      if (facilitador?.id) {
        await pb.collection('facilitadores').update(facilitador.id, dataToSave, { $autoCancel: false });
        toast.success('Facilitador actualizado exitosamente');
      } else {
        await pb.collection('facilitadores').create(dataToSave, { $autoCancel: false });
        toast.success('Facilitador creado exitosamente');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving facilitador:', error);
      toast.error(error.message || 'Error al guardar el facilitador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{facilitador ? 'Editar Facilitador' : 'Nuevo Facilitador'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Select value={formData.especialidad} onValueChange={(val) => setFormData(prev => ({ ...prev, especialidad: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIALIDADES.map(esp => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(val) => setFormData(prev => ({ ...prev, estado: val }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiencia_anos">Años de Experiencia</Label>
              <Input id="experiencia_anos" name="experiencia_anos" type="number" min="0" value={formData.experiencia_anos} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Idiomas</Label>
            <div className="flex flex-wrap gap-4">
              {IDIOMAS_DISPONIBLES.map(idioma => (
                <div key={idioma} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`idioma-${idioma}`} 
                    checked={(formData.idiomas || []).includes(idioma)}
                    onCheckedChange={() => handleIdiomaToggle(idioma)}
                  />
                  <label htmlFor={`idioma-${idioma}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {idioma}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto_url">URL de Foto (Opcional)</Label>
            <Input id="foto_url" name="foto_url" value={formData.foto_url} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificaciones">Certificaciones</Label>
            <Textarea id="certificaciones" name="certificaciones" value={formData.certificaciones} onChange={handleChange} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biografia">Biografía</Label>
            <Textarea id="biografia" name="biografia" value={formData.biografia} onChange={handleChange} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_disponible">Horario Disponible (Notas)</Label>
            <Textarea id="horario_disponible" name="horario_disponible" value={formData.horario_disponible} onChange={handleChange} rows={2} placeholder="Ej: Lunes a Viernes por las mañanas..." />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
