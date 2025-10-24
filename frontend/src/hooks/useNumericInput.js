import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar campos numéricos que permiten borrar completamente
 * @param {number} initialValue - Valor inicial
 * @param {function} onChange - Función callback cuando cambia el valor
 * @returns {object} - { value, displayValue, handleChange, handleBlur, handleFocus }
 */
export const useNumericInput = (initialValue = 0, onChange = null) => {
  const [value, setValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(initialValue.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Actualizar displayValue cuando cambia el valor externo
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Permitir campo vacío temporalmente
    if (inputValue === '') {
      setDisplayValue('');
      return;
    }
    
    // Solo permitir números y punto decimal
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setDisplayValue(inputValue);
      setValue(numericValue);
      
      // Llamar callback si existe
      if (onChange) {
        onChange(numericValue);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Si el valor es 0, permitir borrar completamente
    if (value === 0) {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Si el campo está vacío, establecer a 0
    if (displayValue === '') {
      setDisplayValue('0');
      setValue(0);
      if (onChange) {
        onChange(0);
      }
    } else {
      // Asegurar que displayValue coincida con value
      setDisplayValue(value.toString());
    }
  };

  const setValueMethod = (newValue) => {
    setValue(newValue);
    setDisplayValue(newValue.toString());
  };

  return {
    value,
    displayValue,
    handleChange,
    handleBlur,
    handleFocus,
    setValue: setValueMethod
  };
};

