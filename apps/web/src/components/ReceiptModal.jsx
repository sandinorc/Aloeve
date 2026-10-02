import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReceiptModal({ isOpen, onClose, saleData, onNewSale }) {
  if (!saleData) return null;

  const handlePrint = () => {
    const content = document.getElementById('receipt-print-content');
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      console.error("Popup blocked");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir Recibo</title>
          <style>
            @page { margin: 0; }
            body {
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              font-family: Arial, sans-serif;
            }
            #receipt-print-content {
              width: 80mm;
              padding: 10mm;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .receipt-header { text-align: center; margin-bottom: 15px; }
            .text-xl { font-size: 18px; font-weight: bold; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-base { font-size: 16px; }
            .font-bold { font-weight: bold; }
            .font-normal { font-weight: normal; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .mt-8 { margin-top: 32px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .pt-2 { padding-top: 8px; }
            .pb-4 { padding-bottom: 16px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .border-b { border-bottom: 1px solid black; }
            .border-t { border-top: 1px solid black; }
            .border-dashed { border-style: dashed !important; }
            .border-gray-200 { border-color: #e5e7eb; }
            .w-full { width: 100%; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px dashed black; padding: 4px 0; }
            th { border-bottom: 1px solid black; font-weight: bold; }
          </style>
        </head>
        <body>
          ${content.outerHTML}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  let formattedDate = '';
  try {
    const validDate = saleData.fecha ? new Date(saleData.fecha) : new Date();
    if (isNaN(validDate.getTime())) {
      throw new Error('Invalid date');
    }
    formattedDate = format(validDate, 'dd/MM/yyyy HH:mm:ss');
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white">
        <div className="p-6 no-print">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-serif text-green-600">¡Venta Completada!</DialogTitle>
          </DialogHeader>
        </div>

        {/* Printable Area */}
        <div id="receipt-print-content" className="receipt-print p-6">
          <div className="receipt-header">
            <div className="text-xl font-bold">ALOEVE STUDIO</div>
            <div className="text-xs font-normal mt-1">RNC: 132-45678-9</div>
            <div className="text-xs font-normal">Plaza Central, Local 4B</div>
            <div className="text-xs font-normal">Santo Domingo, RD</div>
            
            <div className="mt-4 border-b border-black pb-4">
              <div className="font-bold">RECIBO DE VENTA</div>
              <div className="text-xs font-normal mt-2">Fecha: {formattedDate}</div>
              <div className="text-xs font-normal">Ticket #: {saleData.id.substring(0, 8).toUpperCase()}</div>
              <div className="text-xs font-normal mt-2">Cliente: {saleData.cliente_nombre || 'Consumidor Final'}</div>
            </div>
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-1">CANT</th>
                <th className="text-left py-1">DESCRIPCION</th>
                <th className="text-right py-1">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {saleData.productos && saleData.productos.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 border-dashed">
                  <td className="py-1">{item.cantidad}</td>
                  <td className="py-1">{item.nombre}</td>
                  <td className="text-right py-1">RD$ {(item.subtotal).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-total text-sm">
            <div className="flex justify-between font-normal mb-1">
              <span>SUBTOTAL:</span>
              <span>RD$ {saleData.subtotal?.toLocaleString('es-DO', { minimumFractionDigits: 2 }) || '0.00'}</span>
            </div>
            <div className="flex justify-between font-normal mb-2">
              <span>ITBIS (18%):</span>
              <span>RD$ {saleData.itbis?.toLocaleString('es-DO', { minimumFractionDigits: 2 }) || '0.00'}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-black font-bold text-base">
              <span>TOTAL A PAGAR:</span>
              <span>RD$ {saleData.total?.toLocaleString('es-DO', { minimumFractionDigits: 2 }) || '0.00'}</span>
            </div>
          </div>

          <div className="text-center mt-8 text-xs font-normal">
            <p>¡Gracias por su compra!</p>
            <p>Vuelva pronto</p>
          </div>
        </div>

        <div className="p-6 bg-muted/30 flex gap-3 no-print">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir Recibo
          </Button>
          <Button className="flex-1" onClick={onNewSale}>
            <PlusCircle className="w-4 h-4 mr-2" /> Nueva Venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}