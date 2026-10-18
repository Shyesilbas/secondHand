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
 bg: 'bg-background-tertiary border-card-border-hover',
 badge: 'bg-primary-hover text-white',
 icon: <FiCheckCircle className="w-4 h-4 text-text-primary" />,
 label: t("status_accepted")
 };
 case 'REJECTED':
 return {
 bg: 'bg-background-secondary border-border',
 badge: 'bg-status-error text-white',
 icon: <FiXCircle className="w-4 h-4 text-status-error-text" />,
 label: t("status_rejected")
 };
 case 'EXPIRED':
 return {
 bg: 'bg-background-secondary border-border',
 badge: 'bg-secondary-500 text-white',
 icon: <FiClock className="w-4 h-4 text-text-tertiary" />,
 label: t("status_expired")
 };
 default:
 return {
 bg: 'bg-background-tertiary/80 border-card-border-hover',
 badge: 'bg-primary text-white',
 icon: <FiTag className="w-4 h-4 text-text-primary" />,
 label: t("status_pending")
 };
 }
 };

 const statusConfig = getStatusConfig();

 return (
 <div className={`my-2 p-4 rounded-md border shadow-sm max-w-sm w-full transition-all duration-200 ${statusConfig.bg}`}>
 {/* Header / Badge */}
 <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/60">
 <div className="flex items-center gap-2">
 {statusConfig.icon}
 <span className="text-xs font-semibold text-text-secondary">
 {t("in_chat_offer_label")}
 </span>
 </div>
 <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${statusConfig.badge}`}>
 {statusConfig.label}
 </span>
 </div>

 {/* Content Details */}
 <div className="space-y-1.5 mb-3">
 {title && (
 <p className="text-xs font-medium text-text-tertiary truncate">
 {title}
 </p>
 )}
 <div className="flex items-baseline justify-between">
 <span className="text-xs text-text-secondary font-medium">
 {t("offered_price")}:
 </span>
 <span className="text-lg font-semibold text-text-primary tracking-tight">
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
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3"
 >
 <FiCheckCircle className="w-3.5 h-3.5" />
 {acceptMutation.isPending ? t("processing") : t("accept")}
 </button>

 <button
 onClick={() => offerId && rejectMutation.mutate(offerId)}
 disabled={rejectMutation.isPending || !offerId}
 className="flex items-center justify-center gap-1.5 px-3 py-2 bg-status-error hover:bg-status-error text-white rounded text-xs font-semibold transition-all disabled:opacity-50"
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
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 w-full"
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
