import { useState, useEffect } from 'react';
import { X, ShoppingCart, Calendar, DollarSign, Eye } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import api from '../../services/api';
import { rentalsService } from '../../services/rentalsService';

const ClientTransactionsModal = ({ isOpen, onClose, client }) => {
  const [sales, setSales] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (isOpen && client) {
      loadTransactions();
    }
  }, [isOpen, client]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Cargar ventas del cliente
      const salesResponse = await api.get(`/sales?client_id=${client.id}`);
      const salesData = salesResponse.data || [];
      
      // Calcular totales si no vienen del backend
      const salesWithTotals = salesData.map(sale => ({
        ...sale,
        total_amount: sale.total_amount || sale.total || sale.amount || 0,
        balance: sale.balance || sale.pending_amount || 0
      }));
      setSales(salesWithTotals);
      
      // Cargar alquileres del cliente usando el servicio específico
      let rentalsData = [];
      try {
        rentalsData = await rentalsService.getClientHistory(client.id);
      } catch (error) {
        console.log('Trying alternative endpoint for rentals...');
        // Fallback: intentar con el endpoint directo
        const rentalsResponse = await api.get(`/rentals?client_id=${client.id}`);
        rentalsData = rentalsResponse.data || [];
      }
      
      // Calcular totales si no vienen del backend
      // Los alquileres usan total_cost en lugar de total_amount
      const rentalsWithTotals = rentalsData.map(rental => ({
        ...rental,
        total_amount: rental.total_cost || rental.total_amount || rental.total || rental.amount || 0,
        balance: rental.balance || rental.pending_amount || 0
      }));
      setRentals(rentalsWithTotals);
      
      console.log('Sales loaded:', salesWithTotals);
      console.log('Rentals loaded:', rentalsWithTotals);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setSales([]);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completada': 'bg-green-100 text-green-700',
      'pendiente': 'bg-yellow-100 text-yellow-700',
      'cancelada': 'bg-red-100 text-red-700',
      'activo': 'bg-blue-100 text-blue-700',
      'devuelto': 'bg-gray-100 text-gray-700',
      'vencido': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      'completada': 'Completada',
      'pendiente': 'Pendiente',
      'cancelada': 'Cancelada',
      'activo': 'Activo',
      'devuelto': 'Devuelto',
      'vencido': 'Vencido'
    };
    return texts[status] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Historial de Transacciones</h2>
              <p className="text-blue-100 mt-1">Cliente: {client?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ventas */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <ShoppingCart className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Ventas</h3>
                    <p className="text-sm text-gray-500">{sales.length} transacciones</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sales.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <ShoppingCart className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">No hay ventas registradas</p>
                    </div>
                  ) : (
                    sales.map((sale) => (
                      <div key={sale.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900">Venta #{sale.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(sale.created_at || sale.sale_date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(sale.status)}`}>
                            {getStatusText(sale.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(sale.total_amount || 0)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Pendiente</p>
                            <p className="text-sm font-bold text-orange-600">{formatCurrency(sale.balance || 0)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Alquileres */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Alquileres</h3>
                    <p className="text-sm text-gray-500">{rentals.length} contratos</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {rentals.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">No hay alquileres registrados</p>
                    </div>
                  ) : (
                    rentals.map((rental) => (
                      <div key={rental.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900">Alquiler #{rental.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(rental.start_date).toLocaleDateString('es-ES')} - {new Date(rental.end_date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(rental.status)}`}>
                            {getStatusText(rental.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(rental.total_amount || 0)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Pendiente</p>
                            <p className="text-sm font-bold text-orange-600">{formatCurrency(rental.balance || 0)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con resumen */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total en Ventas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0))}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total en Alquileres</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(rentals.reduce((sum, rental) => sum + (rental.total_amount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTransactionsModal;
