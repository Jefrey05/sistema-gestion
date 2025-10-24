/**
 * Utilidades para formatear números con formato español (punto como separador de miles, coma como decimal)
 */

/**
 * Formatea un número para visualización con formato español
 * @param {number} value - El número a formatear
 * @param {number} decimals - Cantidad de decimales (default: 2)
 * @returns {string} - Número formateado (ej: "8.083,50")
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return '';
  
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Convierte un string con formato español a número
 * @param {string} value - String con formato español (ej: "8.083,50")
 * @returns {number} - Número parseado
 */
export const parseSpanishNumber = (value) => {
  if (!value || value === '') return 0;
  
  // Convertir string a string si no lo es
  const stringValue = String(value);
  
  // Remover puntos (separadores de miles) y reemplazar coma por punto
  const normalized = stringValue
    .replace(/\./g, '')  // Remover puntos
    .replace(/,/g, '.');  // Reemplazar coma por punto
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formatea un input mientras el usuario escribe
 * Permite puntos, comas y números
 * @param {string} value - Valor actual del input
 * @returns {string} - Valor formateado parcialmente
 */
export const formatInputValue = (value) => {
  if (!value) return '';
  
  // Permitir solo números, puntos y comas
  let cleaned = String(value).replace(/[^\d.,]/g, '');
  
  // Asegurar solo una coma decimal
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  return cleaned;
};

/**
 * Valida si un string es un número válido en formato español
 * @param {string} value - String a validar
 * @returns {boolean} - true si es válido
 */
export const isValidSpanishNumber = (value) => {
  if (!value || value === '') return true;
  
  // Patrón: números con puntos como separadores de miles y coma como decimal
  // Ejemplos válidos: "1234", "1.234", "1.234,56", "1234,56"
  const pattern = /^(\d{1,3}(\.\d{3})*|\d+)(,\d{0,2})?$/;
  return pattern.test(String(value));
};

/**
 * Formatea un número para mostrar en un input (sin separadores de miles mientras edita)
 * @param {number} value - Número a formatear
 * @returns {string} - String formateado para edición
 */
export const formatForInput = (value) => {
  if (value === null || value === undefined || value === '') return '';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return '';
  
  // Convertir a string con coma decimal
  return number.toString().replace('.', ',');
};
