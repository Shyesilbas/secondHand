import {Check} from 'lucide-react';

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
        <div className="p-5">
            <div className="mb-5">
                <h2 className="text-[15px] font-semibold text-gray-900 tracking-[-0.01em] mb-1">Address & Notes</h2>
                <p className="text-[12px] text-gray-400">Select shipping and billing addresses.</p>
            </div>

            <div className="space-y-6">
                {/* Order Name */}
                <div>
                    <h3 className="text-[13px] font-medium text-gray-900 mb-2">Order Name <span className="text-gray-400 font-normal">(optional)</span></h3>
                    <input
                        type="text"
                        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 transition-colors"
                        placeholder="e.g., Birthday Gift, Office Order"
                        value={orderName || ''}
                        onChange={(e) => setOrderName(e.target.value)}
                        maxLength={100}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Helps you identify this order later.</p>
                </div>
                {/* Shipping Address */}
                <div>
                    <h3 className="text-[13px] font-medium text-gray-900 mb-2">Shipping Address</h3>
                    {!addresses || addresses.length === 0 ? (
                        <div className="text-[12px] text-gray-400 text-center py-6">
                            No addresses found. Please add an address to continue.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {addresses?.map((address) => {
                            const isSelected = String(selectedShippingAddressId) === String(address.id);
                            return (
                            <label
                                key={address.id}
                                className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-150 ${
                                    isSelected
                                        ? 'border border-gray-900 bg-gray-50'
                                        : 'border border-gray-100 bg-white hover:border-gray-200'
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
                                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="pr-7">
                                    <div className="text-[13px] font-medium text-gray-900">{address.addressLine}</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                        {address.city}, {address.state} {address.postalCode}
                                    </div>
                                    <div className="text-[11px] text-gray-400">{address.country}</div>
                                    {address.mainAddress && (
                                        <span className="text-[10px] font-medium text-gray-500 mt-1 inline-block">Default</span>
                                    )}
                                </div>
                            </label>
                        );})}
                        <button
                            type="button"
                            className="px-4 py-3 rounded-lg border border-dashed border-gray-200 text-[12px] text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 font-medium"
                        >
                            <span>+</span> Add Address
                        </button>
                    </div>
                    )}
                </div>

                {/* Billing Address */}
                <div>
                    <h3 className="text-[13px] font-medium text-gray-900 mb-2">Billing Address</h3>
                    {!addresses || addresses.length === 0 ? (
                        <div className="text-[12px] text-gray-400 text-center py-6">
                            No addresses found. Please add an address to continue.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {addresses?.map((address) => {
                            const isSelected = String(selectedBillingAddressId) === String(address.id);
                            return (
                            <label
                                key={address.id}
                                className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-150 ${
                                    isSelected
                                        ? 'border border-gray-900 bg-gray-50'
                                        : 'border border-gray-100 bg-white hover:border-gray-200'
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
                                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="pr-7">
                                    <div className="text-[13px] font-medium text-gray-900">{address.addressLine}</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                        {address.city}, {address.state} {address.postalCode}
                                    </div>
                                    <div className="text-[11px] text-gray-400">{address.country}</div>
                                    {address.mainAddress && (
                                        <span className="text-[10px] font-medium text-gray-500 mt-1 inline-block">Default</span>
                                    )}
                                </div>
                            </label>
                        );})}
                        <button
                            type="button"
                            className="px-4 py-3 rounded-lg border border-dashed border-gray-200 text-[12px] text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 font-medium"
                        >
                            <span>+</span> Add Address
                        </button>
                    </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <h3 className="text-[13px] font-medium text-gray-900 mb-2">Notes <span className="text-gray-400 font-normal">(optional)</span></h3>
                    <textarea
                        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 transition-colors resize-none"
                        rows="3"
                        placeholder="Special instructions for the seller…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-50">
                <button
                    onClick={onBack}
                    className="px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-[13px] font-medium transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={!isStepValid}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default CheckoutAddressStep;
