import { createContext, useContext, useState } from 'react';

const DateFilterContext = createContext();

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter debe usarse dentro de DateFilterProvider');
  }
  return context;
};

export const DateFilterProvider = ({ children }) => {
  // Inicializar sin filtro de fecha (mostrar TODO por defecto)
  // Esto evita problemas de zona horaria al cargar la página
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const value = {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleDateChange,
    clearDates
  };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export default DateFilterContext;
