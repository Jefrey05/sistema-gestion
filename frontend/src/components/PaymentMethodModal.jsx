import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, FileText } from 'lucide-react';

const PaymentMethodModal = ({ isOpen, onClose, onConfirm, defaultMethod = 'efectivo' }) => {
  const [selectedMethod, setSelectedMethod] = useState(defaultMethod);

  // Actualizar el método seleccionado cuando cambie el defaultMethod
  useEffect(() => {
    setSelectedMethod(defaultMethod);
  }, [defaultMethod]);

  const paymentMethods = [
    {
      id: 'efectivo',
      name: 'Efectivo',
      icon: Banknote,
      description: 'Pago en efectivo'
    },
    {
      id: 'tarjeta',
      name: 'Tarjeta',
      icon: CreditCard,
      description: 'Tarjeta de crédito/débito'
    },
    {
      id: 'transferencia',
      name: 'Transferencia',
      icon: Smartphone,
      description: 'Transferencia bancaria'
    },
    {
      id: 'cheque',
      name: 'Cheque',
      icon: FileText,
      description: 'Pago con cheque'
    }
  ];

  const handleConfirm = () => {
    if (selectedMethod) {
      onConfirm(selectedMethod);
      setSelectedMethod('');
    }
  };

  const handleClose = () => {
    setSelectedMethod('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Método de Pago</h3>
          <p className="text-gray-600">
            Selecciona el método de pago para convertir la cotización en venta
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{method.name}</p>
                    <p className="text-sm opacity-75">{method.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;