import React, { memo } from 'react';
import { ShoppingCart, DollarSign, CheckCircle, Clock, XCircle, Eye, Package } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useCurrency } from '../hooks/useCurrency';

const SalesListItem = memo(({ sale, onAddPayment, onChangeStatus, onCancelSale, onViewDetails }) => {
  const { formatCurrency } = useCurrency();

  const getStatusBadge = (status) => {
    const badges = {
      completada: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pendiente_pago: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      parcial: { bg: 'bg-blue-100', text: 'text-blue-700', icon: DollarSign },
      cancelada: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    return badges[status] || badges.completada;
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      efectivo: 'bg-green-50 text-green-700',
      transferencia: 'bg-blue-50 text-blue-700',
      tarjeta: 'bg-purple-50 text-purple-700',
      credito: 'bg-orange-50 text-orange-700',
      cheque: 'bg-gray-50 text-gray-700'
    };
    return badges[method] || badges.efectivo;
  };

  const statusInfo = getStatusBadge(sale.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-green-50 p-3 rounded-xl">
            <ShoppingCart className="text-green-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900">{sale.sale_number}</h3>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.bg} ${statusInfo.text}`}>
                <StatusIcon size={14} />
                {sale.status.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getPaymentMethodBadge(sale.payment_method)}`}>
                {sale.payment_method}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Cliente: {sale.client?.name || 'N/A'} • 
              {formatDateTime(sale.created_at || sale.sale_date, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {/* Mostrar productos */}
            {sale.items && sale.items.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Package size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {sale.items.map(item => `${item.product_name || item.product?.name || 'Producto'} (${item.quantity})`).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(sale.total)}</p>
          <p className="text-sm text-green-600">Pagado: {formatCurrency(sale.paid_amount)}</p>
          {sale.balance > 0 && (
            <p className="text-sm text-red-600">Pendiente: {formatCurrency(sale.balance)}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="ml-4 flex gap-2">
          <button 
            onClick={() => onViewDetails(sale)}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="Ver detalles"
          >
            <Eye size={20} />
          </button>
          {sale.balance > 0 && sale.status !== 'cancelada' && (
            <button 
              onClick={() => onAddPayment(sale)}
              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              title="Agregar pago"
            >
              <DollarSign size={20} />
            </button>
          )}
          {sale.status !== 'cancelada' && (
            <button 
              onClick={() => onCancelSale(sale.id)}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              title="Cancelar venta"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

SalesListItem.displayName = 'SalesListItem';

export default SalesListItem;

