import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { fetchExchangeRate } from '../services/exchangeService.js';

const ExchangeRateModal = ({ isOpen, onClose, price, currency }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState('USD');
    const [rates, setRates] = useState({});

    const defaultTarget = useMemo(() => (currency === 'USD' ? 'EUR' : 'USD'), [currency]);
    React.useEffect(() => {
        setSelected(defaultTarget);
        setRates({});
        setError('');
        setLoading(false);
    }, [isOpen, defaultTarget]);

    const handleQuery = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const data = await fetchExchangeRate(currency, selected);
            setRates(prev => ({ ...prev, [selected]: data.rate }));
        } catch (e) {
            setError('Failed to fetch exchange rates');
        } finally {
            setLoading(false);
        }
    }, [currency, selected]);

    if (!isOpen) return null;

    const convertedValue = rates[selected] != null ? (price * rates[selected]).toFixed(2) : null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded border border-gray-200 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
                            <p className="text-sm text-gray-600">Convert listing price</p>
                        </div>
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        onClick={onClose}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Original Price */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Original Price</p>
                                <p className="text-lg font-semibold text-gray-900">{price} {currency}</p>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">{currency}</span>
                            </div>
                        </div>
                    </div>

                    {/* Currency Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Convert to</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['USD', 'EUR'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { setSelected(opt); setError(''); }}
                                    disabled={currency === opt}
                                    className={`relative flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                        selected === opt 
                                            ? 'border-gray-900 bg-gray-900 text-white' 
                                            : currency === opt
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                        selected === opt ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {opt}
                                    </div>
                                    <span className="text-sm font-medium">{opt}</span>
                                    {currency === opt && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                        {currency === selected && (
                            <p className="text-xs text-gray-500 mt-2">Same as original currency</p>
                        )}
                    </div>

                    {/* Convert Button */}
                    <button
                        onClick={handleQuery}
                        disabled={loading || currency === selected}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Converting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span>Convert</span>
                            </>
                        )}
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    )}

                    {/* Result */}
                    {convertedValue && (
                        <div className="bg-gray-900 text-white rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">Converted Amount</p>
                                    <p className="text-2xl font-semibold">{convertedValue}</p>
                                </div>
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <span className="text-sm font-medium">{selected}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <p className="text-xs text-gray-400">
                                    1 {currency} = {(rates[selected] || 0).toFixed(4)} {selected}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default ExchangeRateModal;


