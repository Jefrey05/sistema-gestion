import { useEffect } from 'react';
import { X, FileText, ShoppingCart, Calendar, User, Package, DollarSign, Calendar as CalendarIcon, CreditCard, CheckCircle } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { formatDate, formatDateTime, debugTimezone } from '../utils/dateUtils';

const DetailModal = ({ isOpen, onClose, data, type }) => {
  const { formatCurrency } = useCurrency();

  // Debug de zona horaria
  useEffect(() => {
    if (data && data.created_at) {
      console.log('Debug zona horaria:', debugTimezone(data.created_at));
      console.log('Fecha original:', data.created_at);
      console.log('Fecha formateada:', formatDateTime(data.created_at));
    }
  }, [data]);

  if (!isOpen || !data) {
    return null;
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'quotation':
        return <FileText className="w-6 h-6 text-green-600" />;
      case 'sale':
        return <ShoppingCart className="w-6 h-6 text-blue-600" />;
      case 'rental':
        return <Calendar className="w-6 h-6 text-purple-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'quotation':
        return 'Cotización Creada';
      case 'sale':
        return 'Venta Registrada';
      case 'rental':
        return 'Alquiler Registrado';
      default:
        return 'Registro Creado';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'quotation':
        return 'text-green-600 bg-green-50';
      case 'sale':
        return 'text-blue-600 bg-blue-50';
      case 'rental':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };


  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '24px'
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor()}`}>
                {getTypeIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getTypeTitle()}</h2>
                <p className="text-sm text-gray-600">Detalles del registro creado</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                ¡{getTypeTitle().replace(' Creada', '').replace(' Registrada', '').replace(' Registrado', '')} exitosamente!
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {type === 'quotation' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número de Cotización</label>
                      <p className="text-lg font-semibold text-gray-900">{data.quotation_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Cotización</label>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(data.quotation_date)}</p>
                    </div>
                  </>
                )}
                
                {type === 'sale' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número de Venta</label>
                      <p className="text-lg font-semibold text-gray-900">{data.sale_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Venta</label>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(data.sale_date)}</p>
                    </div>
                  </>
                )}
                
                {type === 'rental' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número de Alquiler</label>
                      <p className="text-lg font-semibold text-gray-900">{data.rental_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(data.start_date)}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <p className="text-lg font-semibold text-gray-900">{data.client?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    data.status === 'completada' || data.status === 'aceptada' || data.status === 'activo' 
                      ? 'bg-green-100 text-green-800'
                      : data.status === 'pendiente' || data.status === 'pendiente_pago'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {data.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Financiera</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total</label>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      type === 'rental' ? (data.total_cost || 0) : (data.total || 0)
                    )}
                  </p>
                </div>
                
                {type === 'sale' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Monto Pagado</label>
                      <p className="text-xl font-semibold text-green-600">{formatCurrency(data.paid_amount || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Saldo Pendiente</label>
                      <p className="text-xl font-semibold text-yellow-600">{formatCurrency(data.balance || 0)}</p>
                    </div>
                  </>
                )}
                
                {type === 'rental' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Monto Pagado</label>
                      <p className="text-xl font-semibold text-green-600">{formatCurrency(data.paid_amount || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Saldo Pendiente</label>
                      <p className="text-xl font-semibold text-yellow-600">{formatCurrency(data.balance || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Precio por Período</label>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.rental_price || 0)}</p>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Items/Productos */}
            {(data.items && data.items.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
                <div className="space-y-3">
                  {data.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product_name || item.product?.name || 'Producto'}</h4>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} | 
                            Precio unitario: {formatCurrency(item.unit_price || item.rental_price || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal || (item.quantity * item.unit_price) || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Producto para Alquileres */}
            {type === 'rental' && data.product && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Producto Alquilado</h3>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{data.product.name || 'Producto'}</h4>
                      <p className="text-sm text-gray-600">
                        Período: {data.rental_period === 'daily' ? 'Diario' : 
                                 data.rental_period === 'weekly' ? 'Semanal' : 
                                 data.rental_period === 'monthly' ? 'Mensual' : data.rental_period} | 
                        Precio: {formatCurrency(data.rental_price || 0)}
                      </p>
                      {data.product.description && (
                        <p className="text-sm text-gray-500 mt-1">{data.product.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(data.total_cost || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información Adicional */}
            {(data.notes || data.terms_conditions || data.payment_conditions) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                <div className="space-y-3">
                  {data.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Notas</label>
                      <p className="text-gray-900">{data.notes}</p>
                    </div>
                  )}
                  {data.terms_conditions && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Términos y Condiciones</label>
                      <p className="text-gray-900">{data.terms_conditions}</p>
                    </div>
                  )}
                  {data.payment_conditions && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Condiciones de Pago</label>
                      <p className="text-gray-900">{data.payment_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fecha de Creación */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                <span>Registro creado el {formatDateTime(data.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
