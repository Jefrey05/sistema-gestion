import { useState } from 'react';
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react';

const SystemResetModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [step, setStep] = useState(1); // 1: advertencia, 2: confirmación, 3: reseteando

  const requiredText = "RESETEAR SISTEMA";

  const handleConfirm = async () => {
    if (confirmText !== requiredText) {
      return;
    }

    setIsResetting(true);
    setStep(3);
    
    try {
      await onConfirm();
      // El modal se cerrará desde el componente padre
    } catch (error) {
      console.error('Error al resetear:', error);
      setIsResetting(false);
      setStep(1);
    }
  };

  const handleClose = () => {
    if (!isResetting) {
      setConfirmText('');
      setStep(1);
      onClose();
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Resetear Sistema' : step === 2 ? 'Confirmar Reset' : 'Reseteando...'}
            </h2>
          </div>
          {!isResetting && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">⚠️ Advertencia Importante</h3>
                    <p className="text-sm text-red-700">
                      Esta acción eliminará <strong>TODOS</strong> los datos de tu organización de forma permanente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Se eliminarán:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Todas las ventas y transacciones
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Todos los alquileres
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Todas las cotizaciones
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Todos los productos
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Todos los clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Categorías y proveedores
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Movimientos de inventario
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">✅ Se mantendrán:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tu organización y usuarios</li>
                  <li>• Configuraciones básicas</li>
                  <li>• Configuración de moneda</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Última Confirmación</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Esta acción es <strong>IRREVERSIBLE</strong>. No podrás recuperar los datos eliminados.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para confirmar, escribe exactamente: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{requiredText}</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Escribe aquí..."
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reseteando Sistema...</h3>
              <p className="text-sm text-gray-600">
                Por favor espera mientras eliminamos todos los datos. Esto puede tomar unos momentos.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 3 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            {step === 1 ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Continuar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirmText !== requiredText}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    confirmText === requiredText
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  RESETEAR SISTEMA
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemResetModal;



