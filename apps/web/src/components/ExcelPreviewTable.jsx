import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { useAutoCodeGeneration } from '@/hooks/useAutoCodeGeneration.js';

export default function ExcelPreviewTable({ isOpen, onClose, data, type, onConfirm, existingCount }) {
  const [previewData, setPreviewData] = useState([]);
  const { generateMaterialCode, generateProductSKU } = useAutoCodeGeneration();

  useEffect(() => {
    if (isOpen && data && data.length > 0) {
      // Generate preview codes based on existing count + index
      const mappedData = data.map((row, index) => {
        const code = type === 'material' 
          ? generateMaterialCode(existingCount + index)
          : generateProductSKU(existingCount + index);
          
        return {
          ...row,
          _id: `temp_${index}`,
          _generatedCode: code
        };
      });
      setPreviewData(mappedData);
    }
  }, [isOpen, data, type, existingCount]);

  const handleRemoveRow = (idToRemove) => {
    const newData = previewData.filter(row => row._id !== idToRemove);
    
    // Re-generate codes to keep them sequential
    const remappedData = newData.map((row, index) => {
      const code = type === 'material' 
        ? generateMaterialCode(existingCount + index)
        : generateProductSKU(existingCount + index);
      return { ...row, _generatedCode: code };
    });
    
    setPreviewData(remappedData);
  };

  const handleConfirm = () => {
    onConfirm(previewData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Vista Previa de Datos</DialogTitle>
          <DialogDescription>
            Revisa los datos antes de importarlos. Se generarán {previewData.length} registros nuevos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md mt-4">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead>{type === 'material' ? 'Código' : 'SKU'}</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Mínima</TableHead>
                <TableHead>{type === 'material' ? 'Proveedor' : 'Precio'}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No hay datos para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                previewData.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row._generatedCode}
                    </TableCell>
                    <TableCell className="font-medium">{row.nombre}</TableCell>
                    <TableCell className="text-center">{row.cantidad}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row['cantidad minima']}</TableCell>
                    <TableCell>
                      {type === 'material' 
                        ? row.proveedor 
                        : `RD$ ${parseFloat(row.precio).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveRow(row._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="pt-4 mt-auto">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={previewData.length === 0}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar Importación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}