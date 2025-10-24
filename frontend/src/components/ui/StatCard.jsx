import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  gradient = 'from-blue-500 to-cyan-500',
  delay = 0 
}) => {
  const isPositive = trend === 'up';
  
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Header con icono */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white" size={24} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
            isPositive 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {trendValue && (
          <p className="text-xs text-gray-500">vs mes anterior</p>
        )}
      </div>
      
      {/* Decoración de fondo */}
      <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-2xl`}></div>
    </div>
  );
};

export default StatCard;
