import React, { useState } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

const CurrencySelector = ({ isOpen, onClose }) => {
  const { currency, currencySymbol, loading, updateCurrency, getAvailableCurrencies } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [saving, setSaving] = useState(false);

  const currencies = getAvailableCurrencies();

  const handleSave = async () => {
    if (selectedCurrency === currency) {
      onClose();
      return;
    }

    setSaving(true);
    const success = await updateCurrency(selectedCurrency);
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Configurar Moneda</h2>
                <p className="text-blue-100 text-sm">Selecciona la moneda para tu organización</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {currencies.map((curr) => (
              <div
                key={curr.code}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCurrency === curr.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCurrency(curr.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{curr.flag}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{curr.name}</div>
                      <div className="text-sm text-gray-600">
                        {curr.symbol} - {curr.code}
                      </div>
                    </div>
                  </div>
                  {selectedCurrency === curr.code && (
                    <div className="p-1 bg-blue-500 rounded-full">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">💡 Información</h4>
            <p className="text-sm text-gray-600">
              Esta configuración afectará cómo se muestran todos los precios y montos en tu sistema.
              Los datos existentes no se modificarán, solo cambiará la visualización.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;



