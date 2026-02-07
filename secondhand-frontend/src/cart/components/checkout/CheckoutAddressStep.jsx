
const CheckoutAddressStep = ({
    addresses,
    selectedShippingAddressId,
    setSelectedShippingAddressId,
    selectedBillingAddressId,
    setSelectedBillingAddressId,
    notes,
    setNotes,
    orderName,
    setOrderName,
    onNext,
    onBack
}) => {
    const isStepValid = selectedShippingAddressId && selectedBillingAddressId;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tighter">Address & Note</h2>
                <p className="text-slate-500 tracking-tight">Select your shipping and billing addresses for this order.</p>
            </div>

            <div className="space-y-8">
                {/* Order Name */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Name (Optional)</h3>
                    <input
                        type="text"
                        className="w-full p-4 border-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Give your order a name (e.g., Birthday Gift, Office Order)"
                        value={orderName || ''}
                        onChange={(e) => setOrderName(e.target.value)}
                        maxLength={100}
                    />
                    <p className="text-sm text-gray-500 mt-2">You can easily identify this order later with a custom name.</p>
                </div>
                {/* Shipping Address */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                    {!addresses || addresses.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No addresses found. Please add an address to continue.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses?.map((address) => (
                            <label
                                key={address.id}
                                className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                                    String(selectedShippingAddressId) === String(address.id)
                                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="shipping"
                                    value={address.id}
                                    checked={String(selectedShippingAddressId) === String(address.id)}
                                    onChange={(e) => setSelectedShippingAddressId(Number(e.target.value))}
                                    className="sr-only"
                                />
                                <div className="flex items-start space-x-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        String(selectedShippingAddressId) === String(address.id)
                                            ? 'border-indigo-500 bg-indigo-500'
                                            : 'border-slate-300'
                                    }`}>
                                        {String(selectedShippingAddressId) === String(address.id) && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-900 tracking-tight">{address.addressLine}</div>
                                        <div className="text-sm text-slate-600 mt-1 tracking-tight">
                                            {address.addressLine}, {address.city}, {address.state} {address.postalCode}
                                        </div>
                                        <div className="text-sm text-slate-500 tracking-tight">{address.country}</div>
                                        {address.mainAddress && (
                                            <div className="text-xs text-indigo-600 mt-1 font-semibold tracking-tight">Main Address</div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                    )}
                </div>

                {/* Billing Address */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                    {!addresses || addresses.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No addresses found. Please add an address to continue.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses?.map((address) => (
                            <label
                                key={address.id}
                                className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                                    String(selectedBillingAddressId) === String(address.id)
                                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="billing"
                                    value={address.id}
                                    checked={String(selectedBillingAddressId) === String(address.id)}
                                    onChange={(e) => setSelectedBillingAddressId(Number(e.target.value))}
                                    className="sr-only"
                                />
                                <div className="flex items-start space-x-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        String(selectedBillingAddressId) === String(address.id)
                                            ? 'border-indigo-500 bg-indigo-500'
                                            : 'border-slate-300'
                                    }`}>
                                        {String(selectedBillingAddressId) === String(address.id) && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-900 tracking-tight">{address.addressLine}</div>
                                        <div className="text-sm text-slate-600 mt-1 tracking-tight">
                                            {address.addressLine}, {address.city}, {address.state} {address.postalCode}
                                        </div>
                                        <div className="text-sm text-slate-500 tracking-tight">{address.country}</div>
                                        {address.mainAddress && (
                                            <div className="text-xs text-indigo-600 mt-1 font-semibold tracking-tight">Main Address</div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                    <textarea
                        className="w-full p-4 border-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        placeholder="Add any special instructions or notes for the seller (e.g., color preference, size, etc.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors tracking-tight"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-200 font-bold shadow-md hover:shadow-lg tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isStepValid}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CheckoutAddressStep;
