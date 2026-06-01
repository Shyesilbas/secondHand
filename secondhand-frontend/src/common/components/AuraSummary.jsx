import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { get } from '../services/api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export const AuraSummary = ({ type, id }) => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = API_ENDPOINTS.AI.SUMMARY(type, id);
            const text = await get(url);
            setSummary(text);
        } catch (e) {
            setError(e.message || 'Özet alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchSummary();
        }
    }, [type, id]);

    return (
        <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/20 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-[13px] tracking-tight">
                    <Sparkles className="w-4.5 h-4.5 animate-[pulse_1.5s_infinite] text-indigo-600 shrink-0" />
                    <span>Aura AI Yorum Analizi</span>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 shadow-sm shrink-0">
                    Analizler belirli aralıklarla tekrar yapılmaktadır.
                </span>
            </div>

            {loading ? (
                <div className="flex items-center text-xs text-indigo-500 font-semibold py-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" />
                    Aura yorumları inceliyor ve özetliyor...
                </div>
            ) : error ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            ) : (
                <p className="text-xs sm:text-[13px] text-indigo-950/80 leading-relaxed font-semibold whitespace-pre-line">
                    {summary}
                </p>
            )}
        </div>
    );
};

export default AuraSummary;
