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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Exchange Rates</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        onClick={onClose}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 mb-5">
                    <div className="text-sm text-gray-600">Listing price: {price} {currency}</div>
                    {error && <div className="text-sm text-red-600">{error}</div>}
                </div>

                <div className="mb-5">
                    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                        {['USD', 'EUR'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => { setSelected(opt); setError(''); }}
                                className={`${selected === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} px-4 py-2 text-sm`}
                                disabled={currency === opt}
                                title={currency === opt ? 'Same as listing currency' : ''}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-5 max-w-md">
                    <button
                        onClick={handleQuery}
                        disabled={loading || currency === selected}
                        className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? 'Yükleniyor...' : 'SORGU'}
                    </button>
                </div>

                <div className="space-y-2 max-w-md">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-gray-700">{selected}</span>
                        <span className="font-medium">{convertedValue ? `${convertedValue} ${selected}` : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default ExchangeRateModal;


