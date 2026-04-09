import {Check, Plus} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../../common/constants/routes.js';

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
    const navigate = useNavigate();
    const isStepValid = selectedShippingAddressId && selectedBillingAddressId;
    const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

    return (
        <div className="p-5 sm:p-6 lg:p-7">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight mb-1">Address & Notes</h2>
                <p className="text-sm text-slate-500">Select shipping and billing addresses for this order.</p>
            </div>

            <div className="space-y-7">
                {/* Order Name */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Order Name <span className="text-slate-400 font-normal">(optional)</span></h3>
                    <input
                        type="text"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
                        placeholder="e.g., Birthday Gift, Office Order"
                        value={orderName || ''}
                        onChange={(e) => setOrderName(e.target.value)}
                        maxLength={100}
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Helps you identify this order later.</p>
                </div>
                {/* Shipping Address */}
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-sm font-semibold text-slate-900">Shipping Address</h3>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Required</span>
                    </div>
                    {!hasAddresses ? (
                        <div className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="mb-3">No addresses found. Please add an address to continue.</p>
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.PROFILE)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Address
                            </button>
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses?.map((address) => {
                            const isSelected = String(selectedShippingAddressId) === String(address.id);
                            return (
                            <label
                                key={address.id}
                                className={`relative px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                                    isSelected
                                        ? 'border border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-100'
                                        : 'border border-slate-200 bg-white hover:border-slate-300'
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
                                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="pr-7">
                                    <div className="text-sm font-semibold text-slate-900">{address.addressLine}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">
                                        {address.city}, {address.state} {address.postalCode}
                                    </div>
                                    <div className="text-xs text-slate-500">{address.country}</div>
                                    {address.mainAddress && (
                                        <span className="text-[11px] font-semibold text-indigo-700 mt-1 inline-block">Default</span>
                                    )}
                                </div>
                            </label>
                        );})}
                        <button
                            type="button"
                            className="px-4 py-3.5 rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500 transition-colors flex items-center justify-center gap-1 font-medium opacity-70 cursor-not-allowed"
                            disabled
                        >
                            <span>+</span> Add Address (Profile)
                        </button>
                    </div>
                    )}
                </div>

                {/* Billing Address */}
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-sm font-semibold text-slate-900">Billing Address</h3>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Required</span>
                    </div>
                    {!hasAddresses ? (
                        <div className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="mb-3">No addresses found. Please add an address to continue.</p>
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.PROFILE)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Address
                            </button>
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses?.map((address) => {
                            const isSelected = String(selectedBillingAddressId) === String(address.id);
                            return (
                            <label
                                key={address.id}
                                className={`relative px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                                    isSelected
                                        ? 'border border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-100'
                                        : 'border border-slate-200 bg-white hover:border-slate-300'
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
                                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="pr-7">
                                    <div className="text-sm font-semibold text-slate-900">{address.addressLine}</div>
                                    <div className="text-xs text-slate-600 mt-0.5">
                                        {address.city}, {address.state} {address.postalCode}
                                    </div>
                                    <div className="text-xs text-slate-500">{address.country}</div>
                                    {address.mainAddress && (
                                        <span className="text-[11px] font-semibold text-indigo-700 mt-1 inline-block">Default</span>
                                    )}
                                </div>
                            </label>
                        );})}
                        <button
                            type="button"
                            className="px-4 py-3.5 rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500 transition-colors flex items-center justify-center gap-1 font-medium opacity-70 cursor-not-allowed"
                            disabled
                        >
                            <span>+</span> Add Address (Profile)
                        </button>
                    </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Notes <span className="text-slate-400 font-normal">(optional)</span></h3>
                    <textarea
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-colors resize-none"
                        rows="3"
                        placeholder="Special instructions for the seller…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            <div className="hidden sm:flex items-center justify-between pt-5 mt-6 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-semibold transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                    disabled={!isStepValid}
                >
                    Continue
                </button>
            </div>

            <div className="sm:hidden sticky bottom-0 -mx-5 mt-6 px-5 py-3 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onBack}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
                    >
                        Back
                    </button>
                    <button
                        onClick={onNext}
                        className="px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                        disabled={!isStepValid}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutAddressStep;
