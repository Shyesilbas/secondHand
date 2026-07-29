import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offerService } from '../../offer/services/offerService.js';
import { Tag as FiTag, CheckCircle2 as FiCheckCircle, XCircle as FiXCircle, Clock as FiClock, ShoppingBag as FiShoppingBag, ArrowRight as FiArrowRight } from 'lucide-react';

export const InChatOfferCard = ({ message, currentUserId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const isSender = String(message.senderId) === String(currentUserId);
    const offerId = message.offerId;
    const status = message.offerStatus || 'PENDING';
    const price = message.offerPrice;
    const title = message.listingTitle;

    // Mutations for accept / reject directly in chat
    const acceptMutation = useMutation({
        mutationFn: (id) => offerService.acceptOffer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatMessages', message.chatRoomId] });
            queryClient.invalidateQueries({ queryKey: ['offers'] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id) => offerService.rejectOffer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatMessages', message.chatRoomId] });
            queryClient.invalidateQueries({ queryKey: ['offers'] });
        }
    });

    const getStatusConfig = () => {
        switch (status) {
            case 'ACCEPTED':
                return {
                    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
                    badge: 'bg-emerald-500 text-white',
                    icon: <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
                    label: t('status_accepted', 'Kabul Edildi')
                };
            case 'REJECTED':
                return {
                    bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
                    badge: 'bg-rose-500 text-white',
                    icon: <FiXCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
                    label: t('status_rejected', 'Reddedildi')
                };
            case 'EXPIRED':
                return {
                    bg: 'bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-700',
                    badge: 'bg-slate-500 text-white',
                    icon: <FiClock className="w-4 h-4 text-slate-500" />,
                    label: t('status_expired', 'Süresi Doldu')
                };
            default:
                return {
                    bg: 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/60',
                    badge: 'bg-indigo-600 text-white',
                    icon: <FiTag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
                    label: t('status_pending', 'Yanıt Bekliyor')
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div className={`my-2 p-4 rounded-2xl border shadow-sm max-w-sm w-full transition-all duration-200 ${statusConfig.bg}`}>
            {/* Header / Badge */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    {statusConfig.icon}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {t('in_chat_offer_label', 'Teklif Kartı')}
                    </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusConfig.badge}`}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 mb-3">
                {title && (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                        {title}
                    </p>
                )}
                <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {t('offered_price', 'Teklif Tutarı')}:
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        ₺{price ? Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Interactive Action Buttons */}
            {status === 'PENDING' && !isSender && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        onClick={() => offerId && acceptMutation.mutate(offerId)}
                        disabled={acceptMutation.isPending || !offerId}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        {acceptMutation.isPending ? t('processing', 'İşleniyor...') : t('accept', 'Kabul Et')}
                    </button>

                    <button
                        onClick={() => offerId && rejectMutation.mutate(offerId)}
                        disabled={rejectMutation.isPending || !offerId}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
                    >
                        <FiXCircle className="w-3.5 h-3.5" />
                        {rejectMutation.isPending ? t('processing', 'İşleniyor...') : t('reject', 'Reddet')}
                    </button>
                </div>
            )}

            {status === 'ACCEPTED' && (
                <div className="pt-1">
                    <button
                        onClick={() => navigate(`/checkout?offerId=${offerId}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition-all"
                    >
                        <FiShoppingBag className="w-4 h-4" />
                        <span>{t('proceed_to_checkout', 'Satın Almayı Tamamla')}</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};
