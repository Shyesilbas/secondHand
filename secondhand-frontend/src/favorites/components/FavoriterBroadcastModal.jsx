import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { X as FiX, Tag as FiTag, Send as FiSend, Users as FiUsers, Clock as FiClock, Percent as FiPercent } from 'lucide-react';

export const FavoriterBroadcastModal = ({ isOpen, onClose, listing, favoriterCount = 0 }) => {
    const { t } = useTranslation();
    const notification = useNotification();

    const [discountedPrice, setDiscountedPrice] = useState('');
    const [expirationHours, setExpirationHours] = useState(48);

    const basePrice = Number(listing?.price) || 0;

    const broadcastMutation = useMutation({
        mutationFn: (data) => favoriteService.broadcastOfferToFavoriters(listing?.id, data),
        onSuccess: (res) => {
            const data = res?.data || res;
            notification.showSuccess(
                t('success', 'Başarılı'),
                data?.message || t('broadcast_success', 'Favorileyen kullanıcılara özel teklif gönderildi!')
            );
            onClose();
        },
        onError: (err) => {
            notification.showError(
                t('error', 'Hata'),
                err?.response?.data?.message || t('broadcast_failed', 'İndirim gönderilemedi.')
            );
        }
    });

    if (!isOpen || !listing) return null;

    const applyPercentageDiscount = (percent) => {
        if (basePrice > 0) {
            const calculated = basePrice * (1 - percent / 100);
            setDiscountedPrice(calculated.toFixed(2));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const priceNum = parseFloat(discountedPrice);
        if (!isNaN(priceNum) && priceNum > 0) {
            broadcastMutation.mutate({
                discountedPrice: priceNum,
                expirationHours: Number(expirationHours) || 48
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
                            <FiTag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                                {t('broadcast_modal_title', 'Favorileyenlere Özel İndirim Gönder')}
                            </h3>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1 mt-0.5">
                                <FiUsers className="w-3.5 h-3.5" />
                                {t('favoriter_count_badge', 'Bu ilanı {{count}} kişi favoriledi', { count: favoriterCount })}
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
                    {/* Listing Preview */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">İlan Başlığı</p>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-xs">{listing.title}</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mevcut Fiyat</p>
                            <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                                ₺{basePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Quick Percentage Chips */}
                    {basePrice > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <FiPercent className="w-3.5 h-3.5 text-indigo-500" />
                                {t('quick_discounts', 'Hızlı İndirim Seçenekleri')}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 10, 15, 20].map((percent) => (
                                    <button
                                        key={percent}
                                        type="button"
                                        onClick={() => applyPercentageDiscount(percent)}
                                        className="py-2.5 px-3 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all active:scale-95"
                                    >
                                        %{percent} İndirim
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Discount Price */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t('special_offer_price', 'Favorileyenlere Özel İndirimli Fiyat (₺)')}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">₺</span>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                value={discountedPrice}
                                onChange={(e) => setDiscountedPrice(e.target.value)}
                                placeholder="Örn: 4200.00"
                                className="w-full pl-9 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Expiration Hours */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5 text-indigo-500" />
                            {t('offer_validity_period', 'Teklif Geçerlilik Süresi')}
                        </label>
                        <select
                            value={expirationHours}
                            onChange={(e) => setExpirationHours(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value={24}>24 Saat (1 Gün)</option>
                            <option value={48}>48 Saat (2 Gün - Tavsiye Edilen)</option>
                            <option value={72}>72 Saat (3 Gün)</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-all"
                        >
                            {t('cancel', 'Vazgeç')}
                        </button>
                        <button
                            type="submit"
                            disabled={broadcastMutation.isPending || !discountedPrice}
                            className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <FiSend className="w-4 h-4" />
                            {broadcastMutation.isPending ? t('broadcasting', 'Gönderiliyor...') : t('send_broadcast_offer', 'Tüm Favorileyenlere Teklifi Gönder')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
