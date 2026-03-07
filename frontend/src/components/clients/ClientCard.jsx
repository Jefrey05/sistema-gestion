import { Building, User, Phone, Mail, MapPin, Edit, Trash2, Eye } from 'lucide-react';

const ClientCard = ({ client, onEdit, onDelete, onViewTransactions }) => {
  const getClientTypeIcon = (type) => {
    switch(type) {
      case 'hospital': return <Building className="text-blue-600" size={20} />;
      case 'medico': return <User className="text-green-600" size={20} />;
      case 'empresa': return <Building className="text-purple-600" size={20} />;
      default: return <User className="text-gray-600" size={20} />;
    }
  };

  const getClientTypeBadge = (type) => {
    const badges = {
      hospital: 'bg-blue-100 text-blue-700 border-blue-200',
      medico: 'bg-green-100 text-green-700 border-green-200',
      empresa: 'bg-purple-100 text-purple-700 border-purple-200',
      particular: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return badges[type] || badges.particular;
  };

  const getStatusBadge = (status) => {
    const badges = {
      activo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactivo: 'bg-gray-100 text-gray-700 border-gray-200',
      suspendido: 'bg-red-100 text-red-700 border-red-200'
    };
    return badges[status] || badges.activo;
  };

  const typeLabels = {
    hospital: 'Hospital',
    medico: 'Médico',
    empresa: 'Empresa',
    particular: 'Particular'
  };

  const statusLabels = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    suspendido: 'Suspendido'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              {getClientTypeIcon(client.client_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{client.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getClientTypeBadge(client.client_type)}`}>
                  {typeLabels[client.client_type]}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusBadge(client.status)}`}>
                  {statusLabels[client.status]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {client.rnc && (
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
            <Building size={16} className="text-gray-500 flex-shrink-0" />
            <span className="font-medium text-gray-500 min-w-[60px]">RNC:</span>
            <span className="font-semibold">{client.rnc}</span>
          </div>
        )}
        
        {client.email && (
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
            <Mail size={16} className="text-blue-500 flex-shrink-0" />
            <span className="font-medium text-gray-500 min-w-[60px]">Email:</span>
            <span className="truncate font-medium">{client.email}</span>
          </div>
        )}
        
        {client.phone && (
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
            <Phone size={16} className="text-green-500 flex-shrink-0" />
            <span className="font-medium text-gray-500 min-w-[60px]">Teléfono:</span>
            <span className="font-medium">{client.phone}</span>
          </div>
        )}
        
        {client.city && (
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
            <MapPin size={16} className="text-red-500 flex-shrink-0" />
            <span className="font-medium text-gray-500 min-w-[60px]">Ciudad:</span>
            <span className="font-medium">{client.city}</span>
          </div>
        )}

      </div>

      {/* Footer con acciones */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onViewTransactions(client)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Eye size={16} />
          Ver Historial
        </button>
        <button
          onClick={() => onEdit(client)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(client.id)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
