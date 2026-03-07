const Card = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  action,
  className = '',
  hover = false 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
        transition-all duration-300
        ${hover ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <Icon className="text-blue-600" size={24} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
