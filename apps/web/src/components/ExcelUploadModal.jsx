import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { validateExcelColumns, normalizeKey, validateMaterialRow, validateProductRow } from '@/lib/ExcelValidation.js';

export default function ExcelUploadModal({ isOpen, onClose, type, onSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setErrors([]);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
      setErrors(['Formato de archivo no soportado. Usa .xlsx, .xls o .csv']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (rawJson.length === 0) {
          setErrors(['El archivo está vacío.']);
          return;
        }

        // Extract headers from the first row keys
        const headers = Object.keys(rawJson[0]);
        const missingColumns = validateExcelColumns(headers, type);
        
        if (missingColumns.length > 0) {
          setErrors([`Faltan columnas requeridas: ${missingColumns.join(', ')}`]);
          return;
        }

        // Normalize data keys
        const standardizedData = rawJson.map(row => {
          const newRow = {};
          Object.keys(row).forEach(k => {
            newRow[normalizeKey(k)] = row[k];
          });
          return newRow;
        });

        // Validate rows
        let rowErrors = [];
        const validData = [];

        standardizedData.forEach((row, index) => {
          const validationErrors = type === 'material' 
            ? validateMaterialRow(row, index) 
            : validateProductRow(row, index);
            
          if (validationErrors.length > 0) {
            rowErrors = [...rowErrors, ...validationErrors];
          } else {
            validData.push(row);
          }
        });

        if (rowErrors.length > 0) {
          // Show max 5 errors to not overwhelm the UI
          const displayErrors = rowErrors.slice(0, 5);
          if (rowErrors.length > 5) {
            displayErrors.push(`...y ${rowErrors.length - 5} errores más.`);
          }
          setErrors(displayErrors);
          return;
        }

        if (validData.length > 0) {
          onSuccess(validData);
          resetState();
        } else {
          setErrors(['No se encontraron datos válidos en el archivo.']);
        }

      } catch (error) {
        console.error("Error parsing Excel:", error);
        setErrors(['Error al leer el archivo. Asegúrate de que no esté corrupto.']);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Carga Masiva de {type === 'material' ? 'Materiales' : 'Productos'}</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel (.xlsx, .xls) o CSV para importar múltiples registros a la vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border">
            <p className="font-medium text-foreground mb-2">Columnas requeridas:</p>
            {type === 'material' ? (
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Nombre</strong> (Texto)</li>
                <li><strong>Cantidad</strong> (Número)</li>
                <li><strong>Cantidad Mínima</strong> (Número)</li>
                <li><strong>Proveedor</strong> (Texto)</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Nombre</strong> (Texto)</li>
                <li><strong>Cantidad</strong> (Número)</li>
                <li><strong>Cantidad Mínima</strong> (Número)</li>
                <li><strong>Precio</strong> (Número)</li>
              </ul>
            )}
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/50 hover:border-primary/50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-background rounded-full shadow-sm border">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Haz clic o arrastra un archivo aquí</p>
                <p className="text-sm text-muted-foreground mt-1">Soporta .xlsx, .xls, .csv</p>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Errores de validación</span>
              </div>
              <ul className="text-sm text-destructive/90 list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}