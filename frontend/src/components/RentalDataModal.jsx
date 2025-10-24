import { useState } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';

const RentalDataModal = ({ isOpen, onClose, onConfirm, quotation }) => {
  const [rentalData, setRentalData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rental_period: 'daily',
    deposit: 0,
    payment_method: quotation?.payment_method || 'efectivo',
    condition_out: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir fechas a formato ISO completo
    const dataToSend = {
      ...rentalData,
      start_date: new Date(rentalData.start_date).toISOString(),
      end_date: new Date(rentalData.end_date).toISOString(),
      deposit: parseFloat(rentalData.deposit) || 0
    };
    
    onConfirm(dataToSend);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRentalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-bold">Datos del Alquiler</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                name="start_date"
                value={rentalData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                name="end_date"
                value={rentalData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Periodo de Alquiler
            </label>
            <select
              name="rental_period"
              value={rentalData.rental_period}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Depósito Inicial
            </label>
            <input
              type="number"
              name="deposit"
              value={rentalData.deposit}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              name="payment_method"
              value={rentalData.payment_method}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Condición al Salir (Opcional)
            </label>
            <textarea
              name="condition_out"
              value={rentalData.condition_out}
              onChange={handleChange}
              rows="3"
              placeholder="Describe el estado del producto al momento del alquiler..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              Convertir a Alquiler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalDataModal;
