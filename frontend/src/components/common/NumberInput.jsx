import { useState, useEffect } from 'react';
import { formatForInput, parseSpanishNumber, formatInputValue } from '../../utils/numberFormat';

/**
 * Input numérico que acepta formato español (punto como separador de miles, coma como decimal)
 * Ejemplo: 8.083,50
 */
const NumberInput = ({ 
  value, 
  onChange, 
  name,
  placeholder = '0,00',
  min,
  max,
  step = '0.01',
  className = 'input-field',
  disabled = false,
  required = false,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Sincronizar el valor de display con el valor prop
  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('');
    } else {
      // Convertir el número a formato de edición (con coma)
      setDisplayValue(formatForInput(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Permitir campo vacío
    if (inputValue === '') {
      setDisplayValue('');
      if (onChange) {
        onChange({
          target: {
            name,
            value: ''
          }
        });
      }
      return;
    }

    // Formatear el input (permitir solo números, puntos y comas)
    const formatted = formatInputValue(inputValue);
    setDisplayValue(formatted);

    // Convertir a número y notificar el cambio
    const numericValue = parseSpanishNumber(formatted);
    
    // Validar min y max - COMENTADO para permitir validación en el formulario
    // if (min !== undefined && numericValue < parseFloat(min)) return;
    // if (max !== undefined && numericValue > parseFloat(max)) return;

    if (onChange) {
      onChange({
        target: {
          name,
          value: numericValue
        }
      });
    }
  };

  const handleBlur = (e) => {
    // Al perder el foco, formatear el número completo
    if (displayValue && displayValue !== '') {
      const numericValue = parseSpanishNumber(displayValue);
      setDisplayValue(formatForInput(numericValue));
    }
    
    // Llamar al onBlur original si existe
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default NumberInput;
