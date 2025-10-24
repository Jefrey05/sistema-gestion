import { X, Printer, Download, Mail, Calendar, User, Package, DollarSign, FileText } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDateTime, formatDate } from '../../utils/dateUtils';
import { generateSalePrintHTML } from '../../utils/printTemplatesNew';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const SaleDetailModal = ({ sale, onClose }) => {
  const { formatCurrency } = useCurrency();
  const [organizationData, setOrganizationData] = useState(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await api.get('/organizations/me');
        console.log('Organization data:', response.data);
        setOrganizationData(response.data);
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    };
    fetchOrganizationData();
  }, []);

  if (!sale) return null;

  const handlePrint = () => {
    const content = generateSalePrintHTML(sale, formatCurrency, formatDate, organizationData);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Esperar a que cargue el contenido antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  const handlePrintOld = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura #${sale.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; }
          .header h1 { color: #0ea5e9; font-size: 32px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; }
          .info-box h3 { color: #0ea5e9; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; }
          .info-box p { margin: 8px 0; font-size: 14px; }
          .info-box strong { color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          thead { background: #0ea5e9; color: white; }
          th { padding: 15px; text-align: left; font-size: 13px; text-transform: uppercase; }
          td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
          tbody tr:hover { background: #f8fafc; }
          .totals { margin-top: 20px; text-align: right; }
          .totals-row { display: flex; justify-content: flex-end; gap: 100px; padding: 8px 0; font-size: 14px; }
          .totals-row.total { border-top: 2px solid #0ea5e9; padding-top: 15px; margin-top: 10px; font-size: 18px; font-weight: bold; color: #0ea5e9; }
          .footer { margin-top: 50px; text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #666; font-size: 12px; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-completada { background: #dcfce7; color: #166534; }
          .status-pendiente { background: #fef3c7; color: #92400e; }
          .status-parcial { background: #dbeafe; color: #1e40af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURA</h1>
          <p>Factura #${sale.id} | Fecha: ${formatDate(sale.created_at)}</p>
        </div>

        <div class="invoice-info">
          <div class="info-box">
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> ${sale.client?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${sale.client?.email || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${sale.client?.phone || 'N/A'}</p>
            ${sale.client?.address ? `<p><strong>Dirección:</strong> ${sale.client.address}</p>` : ''}
            ${sale.client?.document ? `<p><strong>Documento:</strong> ${sale.client.document}</p>` : ''}
          </div>
          
          <div class="info-box">
            <h3>Información de Pago</h3>
            <p><strong>Estado:</strong> <span class="status-badge status-${sale.status}">${sale.status?.toUpperCase()}</span></p>
            <p><strong>Método de Pago:</strong> ${sale.payment_method || 'N/A'}</p>
            ${sale.payment_reference ? `<p><strong>Referencia:</strong> ${sale.payment_reference}</p>` : ''}
            <p><strong>Monto Pagado:</strong> ${formatCurrency(sale.paid_amount || 0)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items?.map(item => `
              <tr>
                <td><strong>${item.product_name || item.product?.name || 'Producto'}</strong></td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatCurrency(item.quantity * item.unit_price)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No hay productos</td></tr>'}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(sale.subtotal || sale.total_amount || 0)}</span>
          </div>
          ${sale.tax_amount ? `
            <div class="totals-row">
              <span>ITBIS/IVA (${sale.tax_rate || 18}%):</span>
              <span>${formatCurrency(sale.tax_amount)}</span>
            </div>
          ` : ''}
          ${sale.discount_amount ? `
            <div class="totals-row">
              <span>Descuento:</span>
              <span>-${formatCurrency(sale.discount_amount)}</span>
            </div>
          ` : ''}
          <div class="totals-row total">
            <span>TOTAL:</span>
            <span>${formatCurrency(sale.total_amount || 0)}</span>
          </div>
        </div>

        ${sale.notes ? `
          <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-left: 4px solid #0ea5e9;">
            <strong>Notas:</strong><br>
            ${sale.notes}
          </div>
        ` : ''}

        <div class="footer">
          <p>Gracias por su compra</p>
          <p>Este documento es una factura válida</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    handlePrint(); // Por ahora usa el mismo método de impresión
  };

  const subtotal = sale.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  const taxAmount = sale.tax_amount || (subtotal * (sale.tax_rate || 0) / 100);
  const discount = sale.discount_amount || 0;
  const total = subtotal + taxAmount - discount;

  const getStatusColor = (status) => {
    const colors = {
      completada: 'bg-green-100 text-green-800',
      pendiente_pago: 'bg-yellow-100 text-yellow-800',
      parcial: 'bg-blue-100 text-blue-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Factura #{sale.id}</h2>
              <p className="text-blue-100 flex items-center gap-2">
                <Calendar size={16} />
                {formatDateTime(sale.created_at, { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
                title="Imprimir"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
                title="Descargar PDF"
              >
                <Download size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cliente */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <User className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cliente</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-semibold">Nombre:</span> {sale.client?.name || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Email:</span> {sale.client?.email || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Teléfono:</span> {sale.client?.phone || 'N/A'}</p>
                {sale.client?.address && (
                  <p className="text-sm"><span className="font-semibold">Dirección:</span> {sale.client.address}</p>
                )}
              </div>
            </div>

            {/* Pago */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <DollarSign className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Información de Pago</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Estado:</span>{' '}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(sale.status)}`}>
                    {sale.status?.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm"><span className="font-semibold">Método:</span> {sale.payment_method || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Pagado:</span> {formatCurrency(sale.paid_amount || 0)}</p>
                <p className="text-sm"><span className="font-semibold">Pendiente:</span> {formatCurrency(Math.max(0, total - (sale.paid_amount || 0)))}</p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Productos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Producto</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Precio Unit.</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{item.product_name || item.product?.name || 'Producto'}</p>
                        {(item.product?.sku || item.sku) && (
                          <p className="text-xs text-gray-500">SKU: {item.product?.sku || item.sku}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-600">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">ITBIS/IVA ({sale.tax_rate || 18}%):</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Descuento:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-black text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notas de Venta */}
          {sale.notes && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Notas:</p>
                  <p className="text-sm text-blue-800">{sale.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notas de Pago */}
          {sale.payment_reference && (
            <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Notas:</p>
                  <p className="text-sm text-orange-800">{sale.payment_reference}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
