import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Banknote, Smartphone, Building2, FileText } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { useNotification } from '../hooks/useNotification';
import NumberInput from './common/NumberInput';

const AddPaymentModal = ({ isOpen, onClose, onConfirm, saleTotal, currentPaid, salePaymentMethod }) => {
  const [selectedMethod, setSelectedMethod] = useState(salePaymentMethod || 'efectivo');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  
  // Actualizar el método seleccionado cuando cambie el método de pago de la venta
  useEffect(() => {
    if (salePaymentMethod) {
      setSelectedMethod(salePaymentMethod);
    }
  }, [salePaymentMethod]);
  
  // Hook para manejar la moneda
  const { formatCurrency } = useCurrency();
  
  // Hook para manejar notificaciones
  const { showError } = useNotification();
  
  const maxAmount = saleTotal - currentPaid;

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
    const numericAmount = parseFloat(amount);
    
    if (!numericAmount || numericAmount <= 0) {
      showError('Debe ingresar un monto válido');
      return;
    }
    
    if (numericAmount > maxAmount) {
      showError(`El monto no puede ser mayor a ${formatCurrency(maxAmount)}`);
      return;
    }
    
    onConfirm(numericAmount, selectedMethod, paymentReference);
    handleClose();
  };

  const handleClose = () => {
    console.log('AddPaymentModal: handleClose called');
    // Resetear el formulario
    setSelectedMethod('efectivo');
    setPaymentReference('');
    setAmount('');
    // Cerrar el modal
    onClose();
  };
  
  const handleSetMaxAmount = () => {
    setAmount(maxAmount.toString());
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="text-green-600" />
            Agregar Pago
          </h3>
          <p className="text-gray-600">
            Registrar un nuevo pago para esta venta
          </p>
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Total de la venta</p>
                <p className="font-bold text-gray-900">{formatCurrency(saleTotal)}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Ya pagado</p>
                <p className="font-bold text-blue-600">{formatCurrency(currentPaid)}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Monto restante</p>
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-all"
                  title="Click para usar este monto"
                >
                  {formatCurrency(maxAmount)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monto del pago */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto del Pago <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
            <NumberInput
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 py-2.5 px-3 text-lg font-semibold"
              placeholder="0,00"
              min="0.01"
              max={maxAmount}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Máximo: {formatCurrency(maxAmount)}
          </p>
        </div>

        {/* Método de pago */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon size={16} className={isSelected ? 'text-green-600' : 'text-gray-600'} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{method.name}</p>
                      <p className="text-xs opacity-75">{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (Opcional)
          </label>
          <textarea
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 py-2 px-3"
            placeholder="Notas internas sobre el pago (no aparecerán en la impresión)..."
          />
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
