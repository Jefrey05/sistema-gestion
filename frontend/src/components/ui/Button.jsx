import { Loader } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'hover:bg-gray-100 text-gray-700'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`
        relative overflow-hidden rounded-xl font-medium
        transition-all duration-300
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Contenido */}
      <span className={`relative z-10 flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {Icon && <Icon size={20} />}
        {children}
      </span>
      
      {/* Spinner de carga */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader className="animate-spin" size={20} />
        </span>
      )}
    </button>
  );
};

export default Button;
