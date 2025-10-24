import api from './api';

const currencyService = {
  // Obtener la moneda actual de la organización
  getCurrentCurrency: async () => {
    const response = await api.get('/organizations/me/currency');
    return response.data;
  },

  // Actualizar la moneda de la organización
  updateCurrency: async (currency) => {
    const response = await api.put('/organizations/me/currency', { currency });
    return response.data;
  },

  // Obtener el símbolo de la moneda
  getCurrencySymbol: (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'DOP': 'DOP'
    };
    return symbols[currency] || '$';
  },

  // Formatear un número como moneda
  formatCurrency: (amount, currency = 'USD') => {
    // Formatear el número con separadores de miles
    const formattedAmount = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    // Para DOP, mostrar solo el monto sin símbolo
    if (currency === 'DOP') {
      return formattedAmount;
    }
    
    // Para USD y EUR, mostrar con símbolo
    const symbol = currencyService.getCurrencySymbol(currency);
    return `${symbol}${formattedAmount}`;
  },

  // Obtener las monedas disponibles
  getAvailableCurrencies: () => {
    return [
      { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
      { code: 'DOP', name: 'Peso Dominicano', symbol: 'DOP', flag: '🇩🇴' }
    ];
  }
};

export default currencyService;
