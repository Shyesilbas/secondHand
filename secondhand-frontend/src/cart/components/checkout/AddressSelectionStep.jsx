
const AddressSelectionStep = ({ 
    addresses, 
    selectedShippingAddressId, 
    setSelectedShippingAddressId,
    selectedBillingAddressId, 
    setSelectedBillingAddressId 
}) => {
    return (
        <div>
            <h4 className="text-md font-semibold mb-3">Select Addresses</h4>
            
            {/* Shipping address list */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                </label>
                {addresses.length === 0 ? (
                    <div className="text-sm text-gray-500">
                        No addresses found. Please add one from your profile.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses.map(addr => (
                            <label
                                key={addr.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                    selectedShippingAddressId === addr.id 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 bg-white hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-semibold text-text-primary flex items-center">
                                            <input
                                                type="radio"
                                                className="mr-2"
                                                name="shippingAddress"
                                                checked={selectedShippingAddressId === addr.id}
                                                onChange={() => setSelectedShippingAddressId(addr.id)}
                                            />
                                            {addr.addressType}
                                            {addr.mainAddress && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    Main
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 text-sm text-text-secondary">
                                            {addr.addressLine}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Billing address selection */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Address (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label 
                        className={`p-4 rounded-lg border cursor-pointer ${
                            selectedBillingAddressId == null 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:shadow-sm'
                        }`}
                    >
                        <div className="flex items-center">
                            <input 
                                type="radio" 
                                className="mr-2" 
                                name="billingAddress" 
                                checked={selectedBillingAddressId == null} 
                                onChange={() => setSelectedBillingAddressId(null)} 
                            />
                            Use shipping address
                        </div>
                    </label>
                    {addresses.map(addr => (
                        <label
                            key={addr.id}
                            className={`p-4 rounded-lg border cursor-pointer ${
                                selectedBillingAddressId === addr.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 bg-white hover:shadow-sm'
                            }`}
                        >
                            <div className="flex items-center">
                                <input 
                                    type="radio" 
                                    className="mr-2" 
                                    name="billingAddress" 
                                    checked={selectedBillingAddressId === addr.id} 
                                    onChange={() => setSelectedBillingAddressId(addr.id)} 
                                />
                                <span className="text-sm text-text-primary">
                                    {addr.addressLine}, {addr.city}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddressSelectionStep;
