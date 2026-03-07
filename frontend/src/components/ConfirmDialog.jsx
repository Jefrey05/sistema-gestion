import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  title = '¿Estás seguro?', 
  message, 
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm, 
  onCancel,
  type = 'warning' // warning, danger, info
}) => {
  const typeConfig = {
    warning: {
      bgColor: 'from-yellow-600 to-orange-600',
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      bgColor: 'from-red-600 to-pink-600',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bgColor: 'from-blue-600 to-cyan-600',
      icon: AlertTriangle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBg: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bgColor} text-white p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className={`${config.iconBg} p-2 rounded-lg`}>
                <Icon className={config.iconColor} size={24} />
              </div>
              {title}
            </h2>
            <button 
              onClick={onCancel}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-lg">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 ${config.confirmBg} text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
