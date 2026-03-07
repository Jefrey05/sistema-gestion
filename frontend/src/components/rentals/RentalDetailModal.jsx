import { X, Printer, Download, Mail, Calendar, User, Package, DollarSign, FileText, Clock, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDateTime, formatDate } from '../../utils/dateUtils';
import { generateRentalPrintHTML } from '../../utils/printTemplatesNew';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const RentalDetailModal = ({ rental, onClose, isQuotation = false }) => {
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

  if (!rental) return null;

  const handlePrint = async () => {
    const content = generateRentalPrintHTML(rental, formatCurrency, formatDate, organizationData, isQuotation);
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

  const days = Math.max(1, Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24)));
  
  // Manejar tanto el modelo antiguo (product) como el nuevo (items)
  const hasItems = rental.items && rental.items.length > 0;
  const subtotal = hasItems 
    ? rental.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0)
    : (rental.rental_price * days) || 0;
    
  // Calcular impuestos y descuentos basados en los campos del backend
  const taxRate = rental.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  
  // Calcular descuento (priorizar discount_percent sobre discount)
  const discountPercent = rental.discount_percent || 0;
  const discountAmount = discountPercent > 0 ? subtotal * (discountPercent / 100) : (rental.discount || 0);
  
  const total = rental.total_cost || (subtotal + taxAmount - discountAmount);
  const pending = total - (rental.paid_amount || 0);

  const getStatusColor = (status) => {
    const colors = {
      activo: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      completado: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = new Date(rental.end_date) < new Date() && rental.status === 'activo';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Alquiler #{rental.id}</h2>
              <p className="text-orange-100 flex items-center gap-2">
                <Calendar size={16} />
                {formatDateTime(rental.created_at, { 
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
          {/* Período de Alquiler */}
          <div className={`mb-6 rounded-2xl p-6 border-2 ${isOverdue ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className={isOverdue ? 'text-red-600' : 'text-orange-600'} size={28} />
              <h3 className="text-xl font-bold text-gray-900">Período de Alquiler</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Inicio</p>
                <p className="text-lg font-bold">
                  {formatDate(rental.start_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Fin</p>
                <p className="text-lg font-bold">
                  {formatDate(rental.end_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Duración</p>
                <p className="text-lg font-bold">{days} días</p>
              </div>
            </div>
            {isOverdue && (
              <div className="mt-4 flex items-center gap-2 text-red-700">
                <AlertTriangle size={20} />
                <p className="font-bold">⚠️ Este alquiler está vencido</p>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cliente */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <User className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cliente</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-semibold">Nombre:</span> {rental.client?.name || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Email:</span> {rental.client?.email || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Teléfono:</span> {rental.client?.phone || 'N/A'}</p>
                {rental.client?.address && (
                  <p className="text-sm"><span className="font-semibold">Dirección:</span> {rental.client.address}</p>
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
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(rental.status)}`}>
                    {rental.status?.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm"><span className="font-semibold">Método:</span> {rental.payment_method || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Pagado:</span> {formatCurrency(rental.paid_amount || 0)}</p>
                <p className="text-sm"><span className="font-semibold">Pendiente:</span> {formatCurrency(pending)}</p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package size={20} className="text-orange-600" />
                Productos Alquilados
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Producto</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Precio/Día</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Días</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hasItems ? (
                    rental.items.map((item, index) => (
                      <tr key={index} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{item.product_name || item.product?.name || 'Producto'}</p>
                          {(item.product?.sku || item.sku) && (
                            <p className="text-xs text-gray-500">SKU: {item.product?.sku || item.sku}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold">{item.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-6 py-4 text-center font-semibold">{days}</td>
                        <td className="px-6 py-4 text-right font-semibold text-orange-600">
                          {formatCurrency(item.quantity * item.unit_price * days)}
                        </td>
                      </tr>
                    ))
                  ) : rental.product ? (
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{rental.product.name || 'Producto'}</p>
                        {rental.product.sku && (
                          <p className="text-xs text-gray-500">SKU: {rental.product.sku}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">1</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(rental.rental_price || 0)}</td>
                      <td className="px-6 py-4 text-center font-semibold">{days}</td>
                      <td className="px-6 py-4 text-right font-semibold text-orange-600">
                        {formatCurrency((rental.rental_price || 0) * days)}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No hay productos en este alquiler
                      </td>
                    </tr>
                  )}
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
                  <span className="text-gray-600 font-medium">ITBIS/IVA ({rental.tax_rate || 18}%):</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    Descuento{discountPercent > 0 ? ` (${discountPercent}%)` : ''}:
                  </span>
                  <span className="font-semibold text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-black text-orange-600">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Pagado:</span>
                <span className="font-semibold text-green-600">{formatCurrency(rental.paid_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Pendiente:</span>
                <span className={`text-lg font-bold ${pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(pending)}
                </span>
              </div>
            </div>
          </div>

          {/* Notas de Alquiler */}
          {rental.notes && (
            <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Notas:</p>
                  <p className="text-sm text-orange-800">{rental.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notas de Pago */}
          {rental.payment_reference && (
            <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Notas:</p>
                  <p className="text-sm text-orange-800">{rental.payment_reference}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDetailModal;
