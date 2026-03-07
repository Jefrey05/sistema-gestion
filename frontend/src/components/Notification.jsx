import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Notification = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  const notificationContent = (
    <div className="fixed top-6 right-6 animate-slide-in-right" style={{ zIndex: 999999, position: 'fixed' }}>
      <div className={`${bgColor} ${borderColor} border-2 rounded-2xl shadow-2xl p-5 pr-14 min-w-[380px] max-w-md backdrop-blur-sm`}>
        <div className="flex items-start gap-4">
          <div className={`${bgColor} ${borderColor} border-2 rounded-full p-2 flex-shrink-0`}>
            <Icon className={iconColor} size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1 pt-1">
            <p className={`${textColor} font-bold text-base leading-relaxed`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${textColor} hover:opacity-70 transition-all hover:scale-110`}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(notificationContent, document.body);
};

export default Notification;








