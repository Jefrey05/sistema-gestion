import { useState } from 'react';
import { Search, X, Calendar, DollarSign, Hash, User } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Buscar...", showFilters = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    client: '',
    number: '',
    amount: '',
    startDate: '',
    endDate: ''
  });

  const handleSearch = () => {
    onSearch({
      searchTerm,
      ...filters
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilters({
      client: '',
      number: '',
      amount: '',
      startDate: '',
      endDate: ''
    });
    onSearch({
      searchTerm: '',
      client: '',
      number: '',
      amount: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          Buscar
        </button>
        {showFilters && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {isExpanded ? 'Menos Filtros' : 'Más Filtros'}
          </button>
        )}
        {(searchTerm || Object.values(filters).some(v => v)) && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Limpiar búsqueda"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Filtros avanzados (colapsables) */}
      {showFilters && isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <User size={16} />
                Cliente
              </label>
              <input
                type="text"
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Nombre del cliente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Número de documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Hash size={16} />
                Número
              </label>
              <input
                type="text"
                value={filters.number}
                onChange={(e) => setFilters({ ...filters, number: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Ej: VEN-001, ALQ-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <DollarSign size={16} />
                Monto
              </label>
              <input
                type="number"
                value={filters.amount}
                onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Monto exacto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Calendar size={16} />
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Calendar size={16} />
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
