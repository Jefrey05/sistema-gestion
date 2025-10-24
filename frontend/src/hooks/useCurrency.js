import { useCurrencyContext } from '../contexts/CurrencyContext';

/**
 * Hook personalizado para manejar la moneda de la organización
 * Ahora usa el contexto global para evitar múltiples llamadas a la API
 */
export const useCurrency = () => {
  return useCurrencyContext();
};

