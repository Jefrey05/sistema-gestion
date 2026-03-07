import { useState, useEffect } from 'react';
import { Calendar, Filter, X } from 'lucide-react';

const DateRangeSelector = ({ onDateChange, initialStartDate, initialEndDate }) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [isOpen, setIsOpen] = useState(false);

  // Función auxiliar para formatear fechas sin problemas de zona horaria
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Opciones predefinidas
  const predefinedRanges = [
    {
      label: 'Hoy',
      getDates: () => {
        const today = new Date();
        const todayStr = formatDate(today);
        return { start: todayStr, end: todayStr };
      }
    },
    {
      label: 'Ayer',
      getDates: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);
        return { start: yesterdayStr, end: yesterdayStr };
      }
    },
    {
      label: 'Esta Semana',
      getDates: () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: formatDate(startOfWeek),
          end: formatDate(endOfWeek)
        };
      }
    },
    {
      label: 'Semana Pasada',
      getDates: () => {
        const today = new Date();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return {
          start: formatDate(startOfLastWeek),
          end: formatDate(endOfLastWeek)
        };
      }
    },
    {
      label: 'Este Mes',
      getDates: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          start: formatDate(startOfMonth),
          end: formatDate(endOfMonth)
        };
      }
    },
    {
      label: 'Mes Pasado',
      getDates: () => {
        const today = new Date();
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          start: formatDate(startOfLastMonth),
          end: formatDate(endOfLastMonth)
        };
      }
    },
    {
      label: 'Últimos 30 Días',
      getDates: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          start: formatDate(thirtyDaysAgo),
          end: formatDate(today)
        };
      }
    },
    {
      label: 'Últimos 90 Días',
      getDates: () => {
        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return {
          start: formatDate(ninetyDaysAgo),
          end: formatDate(today)
        };
      }
    },
    {
      label: 'Este Año',
      getDates: () => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return {
          start: formatDate(startOfYear),
          end: formatDate(endOfYear)
        };
      }
    }
  ];

  // Inicializar con fechas iniciales si existen
  // NO inicializar automáticamente - mostrar TODO por defecto
  useEffect(() => {
    if (initialStartDate !== undefined) {
      setStartDate(initialStartDate || '');
    }
    if (initialEndDate !== undefined) {
      setEndDate(initialEndDate || '');
    }
  }, [initialStartDate, initialEndDate]);

  useEffect(() => {
    if (onDateChange) {
      // Siempre llamar a onDateChange, incluso si las fechas están vacías
      // Esto permite mostrar TODO cuando no hay filtro
      onDateChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateChange]);

  const handlePredefinedRange = (range) => {
    const dates = range.getDates();
    setStartDate(dates.start);
    setEndDate(dates.end);
    setIsOpen(false);
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Todas las fechas';
    
    const formatDisplayDate = (dateStr) => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };
    
    if (startDate === endDate) {
      return formatDisplayDate(startDate);
    }
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) {
      return `Desde ${formatDisplayDate(startDate)}`;
    }
    if (endDate) {
      return `Hasta ${formatDisplayDate(endDate)}`;
    }
    return 'Todas las fechas';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {formatDateRange()}
        </span>
        <Filter className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel del selector */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-50">
          <div className="p-4">
            {/* Fechas personalizadas */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Fechas Personalizadas</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Opciones predefinidas */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Opciones Rápidas</h4>
              <div className="grid grid-cols-2 gap-2">
                {predefinedRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePredefinedRange(range)}
                    className="px-3 py-2 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <button
                onClick={clearDates}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default DateRangeSelector;
