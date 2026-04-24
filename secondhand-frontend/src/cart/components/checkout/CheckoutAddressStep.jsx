import {useState} from 'react';
import {Check, ChevronDown, Plus} from 'lucide-react';
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
    const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

    const [billingSameAsShipping, setBillingSameAsShipping] = useState(
        () => !selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId
    );

    const handleShippingChange = (id) => {
        setSelectedShippingAddressId(Number(id));
        if (billingSameAsShipping) {
            setSelectedBillingAddressId(Number(id));
        }
    };

    const handleBillingToggle = () => {
        const next = !billingSameAsShipping;
        setBillingSameAsShipping(next);
        if (next) {
            setSelectedBillingAddressId(selectedShippingAddressId);
        }
    };

    const isStepValid = selectedShippingAddressId && selectedBillingAddressId;

    const selectedBillingAddress = addresses?.find(a => String(a.id) === String(selectedBillingAddressId));

    return (
        <div className="p-4 sm:p-5">
            {/* Shipping Address — full width */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Shipping Address</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Required</span>
                </div>
                {!hasAddresses ? (
                    <div className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="mb-3">No addresses found.</p>
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.PROFILE)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-500/20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses.map((address) => {
                            const isSelected = String(selectedShippingAddressId) === String(address.id);
                            return (
                                <label
                                    key={address.id}
                                    className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 scale-[1.01] border-transparent'
                                            : 'bg-white border-2 border-slate-100 hover:border-indigo-200 hover:shadow-md'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="shipping"
                                        value={address.id}
                                        checked={isSelected}
                                        onChange={(e) => handleShippingChange(e.target.value)}
                                        className="sr-only"
                                    />
                                    {isSelected && (
                                        <>
                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm z-20">
                                                <Check className="w-4 h-4 text-indigo-600" strokeWidth={3} />
                                            </div>
                                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0 pointer-events-none" />
                                        </>
                                    )}
                                    <div className="pr-8 relative z-10">
                                        <div className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{address.addressLine}</div>
                                        <div className={`text-xs font-medium mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                            {address.city}, {address.state} {address.postalCode}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-xs font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{address.country}</span>
                                            {address.mainAddress && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>Default</span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Billing — inline toggle, saves massive vertical space */}
            {hasAddresses && (
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
                        <button
                            type="button"
                            onClick={handleBillingToggle}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${billingSameAsShipping ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${billingSameAsShipping ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-sm font-bold text-slate-800 tracking-tight">Billing same as shipping</span>
                    </label>

                    {!billingSameAsShipping && (
                        <div className="relative sm:w-64 shrink-0">
                            <select
                                value={selectedBillingAddressId || ''}
                                onChange={(e) => setSelectedBillingAddressId(Number(e.target.value))}
                                className="w-full pl-4 pr-10 py-2.5 text-sm font-semibold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none cursor-pointer transition-all"
                            >
                                <option value="">Choose billing address</option>
                                {addresses.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.addressLine} — {a.city}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            {selectedBillingAddress && !billingSameAsShipping && (
                                <p className="text-[11px] text-slate-500 mt-1.5 pl-1 truncate">
                                    {selectedBillingAddress.city}, {selectedBillingAddress.state} {selectedBillingAddress.postalCode}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Order Name + Notes — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-tight">
                        Order Name <span className="text-slate-400 font-medium">(optional)</span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 text-sm font-medium border-2 border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 bg-white transition-all"
                        placeholder="e.g., Birthday Gift"
                        value={orderName || ''}
                        onChange={(e) => setOrderName(e.target.value)}
                        maxLength={100}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-tight">
                        Notes <span className="text-slate-400 font-medium">(optional)</span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 text-sm font-medium border-2 border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 bg-white transition-all"
                        placeholder="Special instructions…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center justify-between pt-4 mt-4 border-t border-slate-200/60">
                <button
                    onClick={onBack}
                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 text-sm font-bold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!isStepValid}
                >
                    Continue
                </button>
            </div>

            <div className="sm:hidden sticky bottom-0 -mx-4 mt-4 px-4 py-3.5 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-3 rounded-2xl border-2 border-slate-200/80 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={onNext}
                        className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all"
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
