import { Check } from 'lucide-react';

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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Order Name (Optional)</h3>
                    <input
                        type="text"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                        placeholder="Give your order a name (e.g., Birthday Gift, Office Order)"
                        value={orderName || ''}
                        onChange={(e) => setOrderName(e.target.value)}
                        maxLength={100}
                    />
                    <p className="text-sm text-gray-500 mt-2">You can easily identify this order later with a custom name.</p>
                </div>
                {/* Shipping Address */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Shipping Address</h3>
                    {!addresses || addresses.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No addresses found. Please add an address to continue.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses?.map((address) => {
                            const isSelected = String(selectedShippingAddressId) === String(address.id);
                            return (
                            <label
                                key={address.id}
                                className={`relative p-5 rounded-xl cursor-pointer transition-all ${
                                    isSelected
                                        ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-50/30 border border-indigo-200'
                                        : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="shipping"
                                    value={address.id}
                                    checked={isSelected}
                                    onChange={(e) => setSelectedShippingAddressId(Number(e.target.value))}
                                    className="sr-only"
                                />
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="flex items-start space-x-3 pr-8">
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-900 tracking-tight">{address.addressLine}</div>
                                        <div className="text-sm text-slate-600 mt-1 tracking-tight">
                                            {address.city}, {address.state} {address.postalCode}
                                        </div>
                                        <div className="text-sm text-slate-500 tracking-tight">{address.country}</div>
                                        {address.mainAddress && (
                                            <div className="text-xs text-indigo-600 mt-1 font-semibold tracking-tight">Main Address</div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        );})}
                        <button
                            type="button"
                            className="p-5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <span className="text-lg">+</span> Add New Address
                        </button>
                    </div>
                    )}
                </div>

                {/* Billing Address */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Billing Address</h3>
                    {!addresses || addresses.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No addresses found. Please add an address to continue.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses?.map((address) => {
                            const isSelected = String(selectedBillingAddressId) === String(address.id);
                            return (
                            <label
                                key={address.id}
                                className={`relative p-5 rounded-xl cursor-pointer transition-all ${
                                    isSelected
                                        ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-50/30 border border-indigo-200'
                                        : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="billing"
                                    value={address.id}
                                    checked={isSelected}
                                    onChange={(e) => setSelectedBillingAddressId(Number(e.target.value))}
                                    className="sr-only"
                                />
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="flex items-start space-x-3 pr-8">
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-900 tracking-tight">{address.addressLine}</div>
                                        <div className="text-sm text-slate-600 mt-1 tracking-tight">
                                            {address.city}, {address.state} {address.postalCode}
                                        </div>
                                        <div className="text-sm text-slate-500 tracking-tight">{address.country}</div>
                                        {address.mainAddress && (
                                            <div className="text-xs text-indigo-600 mt-1 font-semibold tracking-tight">Main Address</div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        );})}
                        <button
                            type="button"
                            className="p-5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <span className="text-lg">+</span> Add New Address
                        </button>
                    </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Notes</h3>
                    <textarea
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
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
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isStepValid}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CheckoutAddressStep;
