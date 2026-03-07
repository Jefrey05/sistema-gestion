import { useState, useEffect } from 'react';
import { Settings, Target, TrendingUp, Percent, Save, X, Globe } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useNumericInput } from '../hooks/useNumericInput';
import { useCurrency } from '../hooks/useCurrency';
import CurrencySelector from './CurrencySelector';

const DashboardSettings = ({ isOpen, onClose, onSettingsUpdate }) => {
  const [settings, setSettings] = useState({
    monthly_sales_goal: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // Hook para manejar el campo numérico
  const salesGoalInput = useNumericInput(settings.monthly_sales_goal, (value) => {
    setSettings(prev => ({ ...prev, monthly_sales_goal: value }));
  });

  // Hook para manejar la moneda
  const { currency, currencySymbol, formatCurrency } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getDashboardSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dashboardService.updateDashboardSettings(settings);
      onSettingsUpdate(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuraciones del Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando configuraciones...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Meta de Ventas Mensual */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Meta de Ventas Mensual</h3>
                    <p className="text-sm text-gray-600">Establece tu objetivo de ventas para este mes</p>
                  </div>
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="text"
                    value={salesGoalInput.displayValue}
                    onChange={salesGoalInput.handleChange}
                    onFocus={salesGoalInput.handleFocus}
                    onBlur={salesGoalInput.handleBlur}
                    className="w-full pl-10 pr-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Esta meta te ayudará a medir tu progreso mensual</span>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">💡 Consejos para tu meta:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Basa tu meta en ventas anteriores</li>
                  <li>• Considera la temporada y tendencias</li>
                  <li>• Establece objetivos realistas pero ambiciosos</li>
                </ul>
              </div>

              {/* Configuración de Moneda */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Moneda de la Organización</h3>
                    <p className="text-sm text-gray-600">Configura la moneda para mostrar precios y montos</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {currency === 'USD' ? '🇺🇸' : currency === 'EUR' ? '🇪🇺' : '🇩🇴'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {currency === 'USD' ? 'Dólar Estadounidense' : 
                         currency === 'EUR' ? 'Euro' : 'Peso Dominicano'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currencySymbol} - {currency}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCurrencySelector(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Currency Selector Modal */}
        <CurrencySelector
          isOpen={showCurrencySelector}
          onClose={() => setShowCurrencySelector(false)}
        />
      </div>
    </div>
  );
};

export default DashboardSettings;
