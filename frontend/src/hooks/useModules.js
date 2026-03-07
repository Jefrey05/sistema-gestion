import { useState, useEffect } from 'react';
import { organizationsService } from '../services/organizationsService';

export const useModules = () => {
  const [modules, setModules] = useState({
    dashboard: true,
    summary: true,
    sales: true,
    rentals: true,
    quotations: true,
    clients: true,
    inventory: true,
    categories: true,
    suppliers: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      // Timeout para evitar carga infinita
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const organizationPromise = organizationsService.getCurrentOrganization();
      
      const organization = await Promise.race([organizationPromise, timeoutPromise]);
      
      if (organization?.modules_enabled) {
        setModules(organization.modules_enabled);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      // En caso de error, usar configuración por defecto (todos habilitados)
      setModules({
        dashboard: true,
        summary: true,
        sales: true,
        rentals: true,
        quotations: true,
        clients: true,
        inventory: true,
        categories: true,
        suppliers: true
      });
    } finally {
      setLoading(false);
    }
  };

  const isModuleEnabled = (moduleKey) => {
    return modules[moduleKey] === true;
  };

  return {
    modules,
    loading,
    isModuleEnabled,
    refreshModules: loadModules
  };
};
