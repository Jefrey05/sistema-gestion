import { AlertCircle, Check } from 'lucide-react';

const Input = ({ 
  label, 
  error, 
  success,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
            ${Icon ? 'pl-11' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20' 
              : success
              ? 'border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-500/20'
              : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
            }
            focus:outline-none
            disabled:bg-gray-50 disabled:cursor-not-allowed
          `}
          {...props}
        />
        
        {/* Indicador de error/éxito */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="text-red-500" size={20} />
            ) : (
              <Check className="text-green-500" size={20} />
            )}
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
          <span>•</span> {error}
        </p>
      )}
      
      {/* Mensaje de éxito */}
      {success && !error && (
        <p className="text-sm text-green-600 flex items-center gap-1 animate-fadeIn">
          <span>•</span> {success}
        </p>
      )}
    </div>
  );
};

export default Input;
