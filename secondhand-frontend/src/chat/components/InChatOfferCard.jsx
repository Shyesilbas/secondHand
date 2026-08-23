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
 bg: 'bg-slate-100 border-slate-300 dark:bg-slate-950/40 dark:border-slate-900',
 badge: 'bg-slate-800 text-white',
 icon: <FiCheckCircle className="w-4 h-4 text-slate-900 dark:text-slate-600" />,
 label: t("status_accepted")
 };
 case 'REJECTED':
 return {
 bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
 badge: 'bg-rose-500 text-white',
 icon: <FiXCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
 label: t("status_rejected")
 };
 case 'EXPIRED':
 return {
 bg: 'bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-700',
 badge: 'bg-slate-500 text-white',
 icon: <FiClock className="w-4 h-4 text-slate-500" />,
 label: t("status_expired")
 };
 default:
 return {
 bg: 'bg-slate-100/80 border-slate-300 dark:bg-slate-950/40 dark:border-slate-900/60',
 badge: 'bg-slate-900 text-white',
 icon: <FiTag className="w-4 h-4 text-slate-900 dark:text-slate-600" />,
 label: t("status_pending")
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
 {t("in_chat_offer_label")}
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
 {t("offered_price")}:
 </span>
 <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
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
 className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-900 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 transition-all disabled:opacity-50"
 >
 <FiCheckCircle className="w-3.5 h-3.5" />
 {acceptMutation.isPending ? t("processing") : t("accept")}
 </button>

 <button
 onClick={() => offerId && rejectMutation.mutate(offerId)}
 disabled={rejectMutation.isPending || !offerId}
 className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
 >
 <FiXCircle className="w-3.5 h-3.5" />
 {rejectMutation.isPending ? t("processing") : t("reject")}
 </button>
 </div>
 )}

 {status === 'ACCEPTED' && (
 <div className="pt-1">
 <button
 onClick={() => navigate(`/checkout?offerId=${offerId}`)}
 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r bg-slate-900 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-lg shadow-slate-900/10 transition-all"
 >
 <FiShoppingBag className="w-4 h-4" />
 <span>{t("proceed_to_checkout")}</span>
 <FiArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>
 );
};
