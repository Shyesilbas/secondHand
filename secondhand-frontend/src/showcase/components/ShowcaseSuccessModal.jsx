import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

const ShowcaseSuccessModal = ({ isOpen, onClose, listingTitle, days, pricePaid }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {t('showcase_success_title', 'İlanınız Vitrine Taşındı!')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    {listingTitle ? `"${listingTitle}"` : ''} {t('showcase_success_desc', 'ilanınız öne çıkarıldı.')}
                </p>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 mb-6 text-left space-y-2">
                    {days && (
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-300">Süre:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">{days} Gün</span>
                        </div>
                    )}
                    {pricePaid && (
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-300">Ödenen Tutar:</span>
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">₺{pricePaid}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                    {t('close', 'Kapat')}
                </button>
            </div>
        </div>
    );
};

export default ShowcaseSuccessModal;
