import React, { createContext, useContext, useState, useEffect } from 'react';
import currencyService from '../services/currencyService';
import { useAuthStore } from '../store/useAuthStore';

const CurrencyContext = createContext();

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Cargar la moneda actual solo cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && !initialized) {
      loadCurrentCurrency();
    } else if (!isAuthenticated) {
      // Resetear cuando no está autenticado
      setCurrency('USD');
      setCurrencySymbol('$');
      setError(null);
      setInitialized(false);
      setLoading(false);
    }
  }, [isAuthenticated, initialized]);

  const loadCurrentCurrency = async () => {
    try {
      setLoading(true);
      const data = await currencyService.getCurrentCurrency();
      setCurrency(data.currency);
      setCurrencySymbol(data.currency_symbol);
      setError(null);
      setInitialized(true);
    } catch (err) {
      console.error('Error loading currency:', err);
      setError('Error al cargar la configuración de moneda');
      // Usar USD como fallback
      setCurrency('USD');
      setCurrencySymbol('$');
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      setLoading(true);
      const data = await currencyService.updateCurrency(newCurrency);
      setCurrency(data.currency);
      setCurrencySymbol(data.currency_symbol);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating currency:', err);
      setError('Error al actualizar la moneda');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return currencyService.formatCurrency(amount, currency);
  };

  const getAvailableCurrencies = () => {
    return currencyService.getAvailableCurrencies();
  };

  const value = {
    currency,
    currencySymbol,
    loading,
    error,
    updateCurrency,
    formatCurrency,
    getAvailableCurrencies,
    loadCurrentCurrency,
    initialized
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
