/**
 * Utilidades para manejo de fechas
 * El backend ahora maneja correctamente la zona horaria de República Dominicana (UTC-4)
 * Por lo tanto, las fechas que vienen del servidor ya están en la zona horaria correcta
 */

/**
 * Obtiene la zona horaria local del usuario
 * Para República Dominicana, usamos 'America/Santo_Domingo' (UTC-4)
 */
export const getLocalTimeZone = () => {
  return 'America/Santo_Domingo';
};

/**
 * Formatea una fecha a string localizado
 * @param {string|Date} dateString - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('es-ES', {
    ...defaultOptions,
    ...options
  });
};

/**
 * Formatea una fecha y hora a string localizado
 * Formato 24 horas
 * @param {string|Date} dateString - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24 horas
  };
  
  return date.toLocaleString('es-ES', {
    ...defaultOptions,
    ...options
  });
};

/**
 * Formatea solo la hora
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24 horas
  });
};

/**
 * Convierte una fecha UTC a la zona horaria local
 * @param {string|Date} utcDateString - Fecha en UTC
 * @returns {Date} Fecha en zona horaria local
 */
export const convertUTCToLocal = (utcDateString) => {
  if (!utcDateString) return null;
  return new Date(utcDateString);
};

/**
 * Obtiene la fecha actual en la zona horaria local
 * @returns {Date} Fecha actual local
 */
export const getCurrentLocalDate = () => {
  return new Date();
};

/**
 * Formatea una fecha para input de tipo date (YYYY-MM-DD)
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha en formato dominicano (DD/MM/YYYY)
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatDateDominican = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea fecha y hora en formato dominicano
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha y hora en formato dominicano
 */
export const formatDateTimeDominican = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24 horas
  });
};

/**
 * Función de debug para verificar fechas
 * @param {string|Date} dateString - Fecha a verificar
 * @returns {Object} Información de debug
 */
export const debugTimezone = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  return {
    iso: date.toISOString(),
    local: date.toLocaleString('es-ES'),
    formatted: date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    currentTime: new Date().toLocaleString('es-ES'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};
