import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook personalizado para obtener los colores de la organización
 * Retorna los colores personalizados y valores por defecto si no están disponibles
 */
export const useOrganizationColors = () => {
  const [colors, setColors] = useState({
    // Colores principales
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    
    // Colores por módulo
    clients_start: '#10b981',
    clients_end: '#059669',
    quotations_start: '#f59e0b',
    quotations_end: '#d97706',
    sales_start: '#3b82f6',
    sales_end: '#2563eb',
    rentals_start: '#8b5cf6',
    rentals_end: '#7c3aed',
    products_start: '#06b6d4',
    products_end: '#0891b2',
    categories_start: '#ec4899',
    categories_end: '#db2777',
    suppliers_start: '#f97316',
    suppliers_end: '#ea580c',
    goals_start: '#14b8a6',
    goals_end: '#0d9488',
    quickActions_start: '#6366f1',
    quickActions_end: '#4f46e5'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadColors = async () => {
      try {
        const response = await api.get('/organizations/me');
        
        if (response.data) {
          setColors({
            primary: response.data.primary_color || '#3b82f6',
            secondary: response.data.secondary_color || '#8b5cf6',
            clients_start: response.data.clients_start_color || '#10b981',
            clients_end: response.data.clients_end_color || '#059669',
            quotations_start: response.data.quotations_start_color || '#f59e0b',
            quotations_end: response.data.quotations_end_color || '#d97706',
            sales_start: response.data.sales_start_color || '#3b82f6',
            sales_end: response.data.sales_end_color || '#2563eb',
            rentals_start: response.data.rentals_start_color || '#8b5cf6',
            rentals_end: response.data.rentals_end_color || '#7c3aed',
            products_start: response.data.products_start_color || '#06b6d4',
            products_end: response.data.products_end_color || '#0891b2',
            categories_start: response.data.categories_start_color || '#ec4899',
            categories_end: response.data.categories_end_color || '#db2777',
            suppliers_start: response.data.suppliers_start_color || '#f97316',
            suppliers_end: response.data.suppliers_end_color || '#ea580c',
            goals_start: response.data.goals_start_color || '#14b8a6',
            goals_end: response.data.goals_end_color || '#0d9488',
            quickActions_start: response.data.quick_actions_start_color || '#6366f1',
            quickActions_end: response.data.quick_actions_end_color || '#4f46e5'
          });
        }
      } catch (error) {
        console.error('Error loading organization colors:', error);
        // Mantener colores por defecto
      } finally {
        setLoading(false);
      }
    };

    loadColors();
  }, []);

  // Función helper para obtener un gradiente CSS
  const getGradient = (startColor, endColor, direction = 'to right') => {
    return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
  };

  return {
    colors,
    loading,
    getGradient,
    // Gradientes predefinidos para cada módulo
    gradients: {
      primary: getGradient(colors.primary, colors.secondary),
      clients: getGradient(colors.clients_start, colors.clients_end),
      quotations: getGradient(colors.quotations_start, colors.quotations_end),
      sales: getGradient(colors.sales_start, colors.sales_end),
      rentals: getGradient(colors.rentals_start, colors.rentals_end),
      products: getGradient(colors.products_start, colors.products_end),
      categories: getGradient(colors.categories_start, colors.categories_end),
      suppliers: getGradient(colors.suppliers_start, colors.suppliers_end),
      goals: getGradient(colors.goals_start, colors.goals_end),
      quickActions: getGradient(colors.quickActions_start, colors.quickActions_end)
    }
  };
};
