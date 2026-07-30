import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X as FiX, Tag as FiTag, Send as FiSend, Percent as FiPercent } from 'lucide-react';

export const QuickOfferModal = ({ isOpen, onClose, onSubmit, isPending, listingPrice = 0 }) => {
    const { t } = useTranslation();
    const [offeredPrice, setOfferedPrice] = useState('');

    if (!isOpen) return null;

    const basePrice = Number(listingPrice) || 0;

    const applyPercentageDiscount = (percent) => {
        if (basePrice > 0) {
            const calculated = basePrice * (1 - percent / 100);
            setOfferedPrice(calculated.toFixed(2));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const priceNum = parseFloat(offeredPrice);
        if (!isNaN(priceNum) && priceNum > 0) {
            onSubmit(priceNum);
            setOfferedPrice('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <FiTag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                {t("quick_offer_title")}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t("quick_offer_subtitle")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {basePrice > 0 && (
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {t("original_price")}:
                            </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                ₺{basePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    {/* Quick Percentage Chips */}
                    {basePrice > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <FiPercent className="w-3.5 h-3.5 text-indigo-500" />
                                {t("quick_discounts")}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 15].map((percent) => (
                                    <button
                                        key={percent}
                                        type="button"
                                        onClick={() => applyPercentageDiscount(percent)}
                                        className="py-2 px-3 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all active:scale-95"
                                    >
                                        %{percent} İndirim
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("offered_price")}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">₺</span>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                value={offeredPrice}
                                onChange={(e) => setOfferedPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-all"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !offeredPrice}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <FiSend className="w-4 h-4" />
                            {isPending ? t("sending") : t("send_offer")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
