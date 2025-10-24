import { X, Printer, Download, Mail, Calendar, User, Package, DollarSign, FileText, Clock } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDateTime, formatDate } from '../../utils/dateUtils';
import { generateQuotationPrintHTML } from '../../utils/quotationTemplate';
import { generateRentalPrintHTML } from '../../utils/printTemplatesNew';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import RentalDetailModal from '../rentals/RentalDetailModal';

// Funciones helper para extraer información de las notas
const extractDateFromNotes = (notes, label) => {
  if (!notes) return null;
  const match = notes.match(new RegExp(`${label}: ([^\\n]+)`));
  if (match && match[1]) {
    // Limpiar la fecha y retornarla
    return match[1].trim();
  }
  return null;
};

const extractDepositFromNotes = (notes) => {
  if (!notes) return 0;
  const match = notes.match(/Depósito: ([\d.,]+)/);
  return match ? parseFloat(match[1].replace(',', '')) : 0;
};

const QuotationDetailModal = ({ quotation, onClose }) => {
  const { formatCurrency } = useCurrency();
  const [organizationData, setOrganizationData] = useState(null);
  
  // Si es una cotización de alquiler, usar el modal de alquiler
  if (quotation && quotation.quotation_type === 'alquiler') {
    // Convertir la cotización al formato de alquiler
    const rentalData = {
      ...quotation,
      id: quotation.id,
      rental_number: quotation.quotation_number,
      start_date: extractDateFromNotes(quotation.notes, 'Fecha Inicio'),
      end_date: extractDateFromNotes(quotation.notes, 'Fecha Fin'),
      deposit: extractDepositFromNotes(quotation.notes),
      rental_price: quotation.items?.[0]?.unit_price || 0,
      // NO pasar total_cost para que el modal lo calcule automáticamente con días
      paid_amount: 0,
      status: quotation.status === 'aceptada' ? 'activo' : 'pendiente',
      tax_rate: quotation.tax_rate,
      discount: quotation.discount_amount || 0,
      items: quotation.items,
      client: quotation.client,
      created_at: quotation.created_at
    };
    
    return <RentalDetailModal rental={rentalData} onClose={onClose} isQuotation={true} />;
  }

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

  if (!quotation) return null;

  const handlePrint = () => {
    const content = generateQuotationPrintHTML(quotation, formatCurrency, formatDate, organizationData);
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
    const validUntil = quotation.valid_until ? formatDate(quotation.valid_until) : 'No especificado';
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cotización #${quotation.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #8b5cf6; padding-bottom: 20px; }
          .header h1 { color: #8b5cf6; font-size: 32px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .quotation-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; }
          .info-box h3 { color: #8b5cf6; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; }
          .info-box p { margin: 8px 0; font-size: 14px; }
          .info-box strong { color: #1e293b; }
          .validity { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          thead { background: #8b5cf6; color: white; }
          th { padding: 15px; text-align: left; font-size: 13px; text-transform: uppercase; }
          td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
          tbody tr:hover { background: #f8fafc; }
          .totals { margin-top: 20px; text-align: right; }
          .totals-row { display: flex; justify-content: flex-end; gap: 100px; padding: 8px 0; font-size: 14px; }
          .totals-row.total { border-top: 2px solid #8b5cf6; padding-top: 15px; margin-top: 10px; font-size: 18px; font-weight: bold; color: #8b5cf6; }
          .footer { margin-top: 50px; text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #666; font-size: 12px; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-pendiente { background: #fef3c7; color: #92400e; }
          .status-aceptada { background: #dcfce7; color: #166534; }
          .status-rechazada { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>COTIZACIÓN</h1>
          <p>Cotización #${quotation.id} | Fecha: ${formatDate(quotation.created_at)}</p>
        </div>

        <div class="validity">
          <strong>⏰ Válida hasta:</strong> ${validUntil}
        </div>

        <div class="quotation-info">
          <div class="info-box">
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> ${quotation.client?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${quotation.client?.email || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${quotation.client?.phone || 'N/A'}</p>
            ${quotation.client?.address ? `<p><strong>Dirección:</strong> ${quotation.client.address}</p>` : ''}
          </div>
          
          <div class="info-box">
            <h3>Estado de Cotización</h3>
            <p><strong>Estado:</strong> <span class="status-badge status-${quotation.status}">${quotation.status?.toUpperCase()}</span></p>
            <p><strong>Creada:</strong> ${formatDate(quotation.created_at)}</p>
            <p><strong>Válida hasta:</strong> ${validUntil}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto/Servicio</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items?.map(item => `
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
            <span>${formatCurrency(quotation.subtotal || quotation.total_amount || 0)}</span>
          </div>
          ${quotation.tax_amount ? `
            <div class="totals-row">
              <span>ITBIS/IVA (${quotation.tax_rate || 18}%):</span>
              <span>${formatCurrency(quotation.tax_amount)}</span>
            </div>
          ` : ''}
          ${quotation.discount_amount ? `
            <div class="totals-row">
              <span>Descuento:</span>
              <span>-${formatCurrency(quotation.discount_amount)}</span>
            </div>
          ` : ''}
          <div class="totals-row total">
            <span>TOTAL:</span>
            <span>${formatCurrency(quotation.total_amount || 0)}</span>
          </div>
        </div>

        ${quotation.notes ? `
          <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-left: 4px solid #8b5cf6;">
            <strong>Notas:</strong><br>
            ${quotation.notes}
          </div>
        ` : ''}

        <div class="footer">
          <p><strong>Esta cotización es válida hasta: ${validUntil}</strong></p>
          <p>Gracias por su interés en nuestros productos/servicios</p>
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

  const subtotal = quotation.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  const taxAmount = quotation.tax_amount || (subtotal * (quotation.tax_rate || 0) / 100);
  const discount = quotation.discount_amount || 0;
  const total = subtotal + taxAmount - discount;

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aceptada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      expirada: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">{quotation.quotation_number || `Cotización #${quotation.id}`}</h2>
              <p className="text-purple-100 flex items-center gap-2">
                <Calendar size={16} />
                {formatDateTime(quotation.created_at, { 
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
                onClick={handlePrint}
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
          {/* Validez */}
          {quotation.valid_until && (
            <div className={`mb-6 rounded-2xl p-4 border-2 ${isExpired ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
              <div className="flex items-center gap-3">
                <Clock className={isExpired ? 'text-red-600' : 'text-yellow-600'} size={24} />
                <div>
                  <p className="font-bold text-sm">
                    {isExpired ? '⚠️ Cotización Expirada' : '⏰ Válida hasta:'}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatDate(quotation.valid_until)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cliente */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <User className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cliente</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-semibold">Nombre:</span> {quotation.client?.name || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Email:</span> {quotation.client?.email || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Teléfono:</span> {quotation.client?.phone || 'N/A'}</p>
                {quotation.client?.address && (
                  <p className="text-sm"><span className="font-semibold">Dirección:</span> {quotation.client.address}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <FileText className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Estado</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Estado:</span>{' '}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(quotation.status)}`}>
                    {quotation.status?.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm"><span className="font-semibold">Creada:</span> {new Date(quotation.created_at).toLocaleDateString('es-ES')}</p>
                {quotation.valid_until && (
                  <p className="text-sm"><span className="font-semibold">Válida hasta:</span> {new Date(quotation.valid_until).toLocaleDateString('es-ES')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información de Alquiler - Solo para cotizaciones de alquiler */}
          {quotation.quotation_type === 'alquiler' && quotation.notes && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Calendar className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Periodo de Alquiler</h3>
              </div>
              {(() => {
                // Extraer información de alquiler de las notas
                const rentalInfo = quotation.notes.match(/Fecha Inicio: ([^\n]+)\nFecha Fin: ([^\n]+)(?:\nDepósito: ([^\n]+))?/);
                if (rentalInfo) {
                  const startDate = rentalInfo[1];
                  const endDate = rentalInfo[2];
                  const deposit = rentalInfo[3];
                  
                  // Calcular días
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Inicio</p>
                        <p className="font-bold text-gray-900">{new Date(startDate).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Fin</p>
                        <p className="font-bold text-gray-900">{new Date(endDate).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Duración</p>
                        <p className="font-bold text-gray-900">{days} días</p>
                      </div>
                      {deposit && (
                        <div className="col-span-3 mt-2 pt-2 border-t border-orange-200">
                          <p className="text-sm"><span className="font-semibold">Depósito:</span> {formatCurrency(parseFloat(deposit))}</p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Productos */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package size={20} className="text-purple-600" />
                Productos/Servicios
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
                  {quotation.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{item.product_name || item.product?.name || 'Producto'}</p>
                        {(item.product?.sku || item.sku) && (
                          <p className="text-xs text-gray-500">SKU: {item.product?.sku || item.sku}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-purple-600">
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
                  <span className="text-gray-600 font-medium">ITBIS/IVA ({quotation.tax_rate || 18}%):</span>
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
                <span className="text-2xl font-black text-purple-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {quotation.notes && (
            <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-purple-900 mb-1">Notas:</p>
                  <p className="text-sm text-purple-800">{quotation.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailModal;
