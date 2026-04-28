import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';
import { format } from 'date-fns';

export default function InventoryExport({ data, filenamePrefix, label = "Exportar CSV" }) {
  const handleExport = () => {
    if (!data || data.length === 0) return;
    
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `${filenamePrefix}_${dateStr}.csv`;
    
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      className="gap-2 bg-background hover:bg-muted transition-colors"
      disabled={!data || data.length === 0}
    >
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}