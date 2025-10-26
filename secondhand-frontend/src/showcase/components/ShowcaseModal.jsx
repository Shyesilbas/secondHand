import React, {useEffect, useState} from 'react';
import {useEnums} from '../../common/hooks/useEnums.js';
import ShowcasePayment from './ShowcasePayment.jsx';

const ShowcaseModal = ({ isOpen, onClose, listingId, listingTitle = '', onSuccess }) => {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState(7);
    const { enums, isLoading: isPricingLoading } = useEnums();
    
    const showcasePricing = enums.showcasePricingConfig;

    if (!isOpen) return null;
    if (!listingId) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                    <p>Listing Information Not Found.</p>
                    <button className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    const today = new Date();
    const startDate = today.toLocaleDateString('tr-TR');
    const endDate = new Date(today.getTime() + (days - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR');
    
    const calculateTotal = () => {
        if (!showcasePricing) return 0;
        return showcasePricing.totalDailyCost * days;
    };
    
    const calculateSubtotal = () => {
        if (!showcasePricing) return 0;
        return showcasePricing.dailyCost * days;
    };
    
    const calculateTax = () => {
        if (!showcasePricing) return 0;
        return (showcasePricing.totalDailyCost - showcasePricing.dailyCost) * days;
    };
    
    const totalCost = calculateTotal();

    const renderStepContent = () => {
        if (step === 1) {
            return (
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">Showcase Duration</h3>
                    <label className="block text-sm font-medium text-gray-700 mb-2">For how many day(s)?</label>
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={days}
                        onChange={e => setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Minimum 1, maximum 30 days. 
                        {showcasePricing ? (
                            <>Per Day: <span className="font-semibold">{showcasePricing.dailyCost}₺</span></>
                        ) : (
                            <>Per Day: <span className="font-semibold">10₺</span></>
                        )}
                    </p>
                    {showcasePricing && (
                        <div className="mt-4 p-3 bg-gray-50 rounded space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal ({days} days):</span>
                                <span>{calculateSubtotal().toFixed(2)}₺</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax ({showcasePricing.taxPercentage}%):</span>
                                <span>{calculateTax().toFixed(2)}₺</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span className="text-emerald-600">{totalCost.toFixed(2)}₺</span>
                            </div>
                        </div>
                    )}
                    {!showcasePricing && (
                        <div className="flex justify-between mt-4 p-3 bg-gray-50 rounded">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold text-emerald-600">{totalCost}₺</span>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <ShowcasePayment
                    listingId={listingId}
                    listingTitle={listingTitle}
                    days={days}
                    totalCost={totalCost}
                    showcasePricing={showcasePricing}
                    calculateSubtotal={calculateSubtotal}
                    calculateTax={calculateTax}
                    onSuccess={onSuccess}
                    onClose={onClose}
                />
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Showcase</h3>
                    <button className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {/* Step indicator */}
                    <div className="flex items-center space-x-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded ${step >= s ? 'bg-emerald-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    {/* Step content */}
                    {renderStepContent()}
                </div>
                <div className="p-4 border-t flex items-center justify-between">
                    <button
                        className="px-4 py-2 border rounded"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose}
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    {step === 1 && (
                        <button
                            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                            onClick={() => setStep(step + 1)}
                            disabled={days < 1 || days > 30}
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowcaseModal;
