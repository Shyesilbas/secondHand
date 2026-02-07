
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetMain, 
  onSelectAsMain 
}) => {
  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'HOME':
        return '🏠';
      case 'WORK':
        return '🏢';
      case 'OTHER':
        return '📍';
      default:
        return '📍';
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (type) {
      case 'HOME':
        return 'Home';
      case 'WORK':
        return 'Work';
      case 'OTHER':
        return 'Other';
      default:
        return 'Other';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border shadow-sm bg-white transition-all hover:shadow-md ${
        address.mainAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getAddressTypeIcon(address.addressType)}</span>
            <h3 className="font-semibold text-text-primary">
              {getAddressTypeLabel(address.addressType)}
            </h3>
            {address.mainAddress && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                Main
              </span>
            )}
          </div>
          
          <div className="text-sm text-text-secondary space-y-1">
            <p className="font-medium">{address.addressLine}</p>
            <p>{address.city}, {address.state}</p>
            <p>{address.postalCode}, {address.country}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(address)}
            className="text-gray-500 hover:text-btn-primary transition-colors p-1"
            title="Update Address"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(address.id, address.addressType)}
            className="text-gray-500 hover:text-red-500 transition-colors p-1"
            title="Delete Address"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          {!address.mainAddress && (
            <button
              onClick={() => onSelectAsMain(address.id)}
              className="text-xs px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors"
              title="Set as Main Address"
            >
              Set Main
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressCard;