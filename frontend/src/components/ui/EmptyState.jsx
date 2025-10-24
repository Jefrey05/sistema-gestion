const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {/* Icono con animación */}
      <div className="relative mb-6 animate-fadeIn">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-lg">
          <Icon className="text-gray-400" size={48} />
        </div>
      </div>
      
      {/* Contenido */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        {title}
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        {description}
      </p>
      
      {/* Acción */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium animate-fadeInUp"
          style={{ animationDelay: '300ms' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
