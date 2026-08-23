import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import { usePlan } from '../../common/hooks/usePlan.js';
import { showcaseService } from '../services/showcaseService.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import ShowcaseSuccessModal from './ShowcaseSuccessModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
import PremiumUpgradeModal from '../../common/components/ui/PremiumUpgradeModal.jsx';
import { 
 Zap, 
 ShieldCheck, 
 X, 
 TrendingUp, 
 Clock, 
 AlertCircle,
 Crown,
 Loader2
} from 'lucide-react';

const PRESET_DURATIONS = [
 { days: 7, label: '7 Gün', badge: null },
 { days: 14, label: '14 Gün', badge: 'Popüler' },
 { days: 21, label: '21 Gün', badge: null },
 { days: 30, label: '30 Gün', badge: 'En Avantajlı' }
];

const ShowcaseModal = ({
 isOpen,
 onClose,
 listingId,
 listingTitle = '',
 onSuccess,
 isExtension = false,
 showcaseId = null,
 initialDays = 7
}) => {
 const { t } = useTranslation();
 const { plan, maxShowcaseSlots } = usePlan();

 const [days, setDays] = useState(initialDays);
 const [showSuccessNotification, setShowSuccessNotification] = useState(false);
 const [successSummary, setSuccessSummary] = useState(null);
 const [showUpgradeModal, setShowUpgradeModal] = useState(false);
 const [upgradeHint, setUpgradeHint] = useState('');

 // Limit Pre-Check State
 const [isCheckingLimit, setIsCheckingLimit] = useState(false);
 const [limitExceeded, setLimitExceeded] = useState(false);
 const [activeShowcaseCount, setActiveShowcaseCount] = useState(0);

 const showcasePaymentRef = useRef(null);

 const { enums } = useEnums();
 const {
 acceptedAgreements,
 onAgreementToggle,
 onRequiredAgreementsChange,
 getAcceptedAgreementIds
 } = useAgreementsState();

 const { listing, isLoading: isListingLoading, error: listingError } = useListingData(listingId, isOpen);
 const showcasePricing = enums?.showcasePricingConfig;

 // Pre-check showcase limit before making user fill steps
 useEffect(() => {
 if (!isOpen || isExtension) {
 setLimitExceeded(false);
 return;
 }

 let isMounted = true;
 setIsCheckingLimit(true);

 showcaseService.getUserShowcases()
 .then(showcases => {
 if (!isMounted) return;
 const activeList = Array.isArray(showcases) 
 ? showcases.filter(s => s.status === 'ACTIVE') 
 : [];
 const count = activeList.length;
 setActiveShowcaseCount(count);

 if (count >= maxShowcaseSlots) {
 setLimitExceeded(true);
 } else {
 setLimitExceeded(false);
 }
 })
 .catch(() => {
 if (isMounted) setLimitExceeded(false);
 })
 .finally(() => {
 if (isMounted) setIsCheckingLimit(false);
 });

 return () => { isMounted = false; };
 }, [isOpen, isExtension, maxShowcaseSlots]);

 const calculateTotal = useCallback(() => {
 if (!showcasePricing) return 0;
 return showcasePricing.totalDailyCost * days;
 }, [showcasePricing, days]);

 const calculateSubtotal = useCallback(() => {
 if (!showcasePricing) return 0;
 return showcasePricing.dailyCost * days;
 }, [showcasePricing, days]);

 const calculateTax = useCallback(() => {
 if (!showcasePricing) return 0;
 return (showcasePricing.totalDailyCost - showcasePricing.dailyCost) * days;
 }, [showcasePricing, days]);

 const totalCost = useMemo(() => calculateTotal(), [calculateTotal]);

 const handleDaysChange = useCallback(e => {
 const val = parseInt(e.target.value, 10);
 setDays(isNaN(val) ? 1 : Math.max(1, Math.min(30, val)));
 }, []);

 const renderUnifiedCheckout = () => {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
 {/* Left Column: Order & Pricing Summary (Stripe Style 5 cols) */}
 <div className="lg:col-span-5 bg-slate-50/80 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between">
 <div className="space-y-6">
 {/* Modal Title & Close hint */}
 <div>
 <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 mb-3">
 <Zap className="w-5 h-5 fill-current" />
 </div>
 <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
 {isExtension ? 'Vitrin Süresi Uzatma' : 'İlanı Vitrine Çıkar'}
 </h2>
 <p className="text-xs font-medium text-slate-500 mt-1">
 İlanınızı binlerce alıcının önüne en üst sırada çıkarın.
 </p>
 </div>

 {/* Target Listing Card */}
 {(listing || listingTitle) && (
 <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
 <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
 {listing?.images?.[0] ? (
 <img 
 src={listing.images[0]} 
 alt={listing.title} 
 className="w-full h-full object-cover"
 />
 ) : (
 <Zap className="w-5 h-5 text-slate-900 fill-current" />
 )}
 </div>
 <div className="min-w-0 flex-1">
 <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider mb-0.5">
 <TrendingUp className="w-2.5 h-2.5" /> Seçili İlan
 </span>
 <h4 className="text-xs font-extrabold text-slate-900 truncate">
 {listing?.title || listingTitle}
 </h4>
 </div>
 </div>
 )}

 {/* Breakdown List */}
 <div className="space-y-3 pt-2">
 <div className="flex justify-between text-xs text-slate-500 font-medium">
 <span>Seçilen Süre</span>
 <span className="font-extrabold text-slate-900 ">{days} Gün</span>
 </div>
 {showcasePricing && (
 <>
 <div className="flex justify-between text-xs text-slate-500 font-medium">
 <span>Günlük Birim Ücret</span>
 <span className="font-bold text-slate-800">₺{showcasePricing.dailyCost.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-xs text-slate-500 font-medium">
 <span>Ara Toplam</span>
 <span className="font-bold text-slate-800">₺{calculateSubtotal().toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-xs text-slate-500 font-medium">
 <span>KDV (%{showcasePricing.taxPercentage})</span>
 <span className="font-bold text-slate-800">₺{calculateTax().toFixed(2)}</span>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Left Bottom Total & Secure Badge */}
 <div className="pt-6 mt-6 border-t border-slate-200">
 <div className="flex items-baseline justify-between mb-3">
 <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Ödenecek Tutar</span>
 <div className="text-right">
 <span className="text-2xl font-extrabold text-slate-950 tracking-tight">
 ₺{totalCost.toFixed(2)}
 </span>
 <span className="text-[10px] font-bold text-slate-900 block">KDV Dahil</span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium bg-white/70 p-2.5 rounded-xl border border-slate-200/80">
 <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
 <span>Güvenli E-Cüzdan ile anında aktivasyon</span>
 </div>
 </div>
 </div>

 {/* Right Column: Interactive Configuration & Payment Flow (7 cols) */}
 <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-white">
 <div className="space-y-6">
 {/* Step Sub-Header: Duration Selector */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <Clock className="w-4 h-4 text-slate-900" /> Vitrin Süresi
 </label>
 <span className="text-xs font-semibold text-slate-400">
 Hazır paket seçin veya gün girin
 </span>
 </div>

 {/* 4 Presets Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
 {PRESET_DURATIONS.map(opt => {
 const isSelected = days === opt.days;
 return (
 <button
 key={opt.days}
 type="button"
 onClick={() => setDays(opt.days)}
 className={`relative p-3.5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border cursor-pointer ${
 isSelected
 ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 ring-2 ring-slate-900/10'
 : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <span className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
 {opt.days} Gün
 </span>
 {opt.badge && (
 <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded-full ${
 isSelected 
 ? 'bg-amber-400 text-slate-950' 
 : 'bg-slate-200 text-slate-900'
 }`}>
 {opt.badge}
 </span>
 )}
 </div>
 <span className={`text-xs font-extrabold ${isSelected ? 'text-indigo-100' : 'text-slate-600'}`}>
 {showcasePricing ? `₺${(showcasePricing.totalDailyCost * opt.days).toFixed(0)}` : ''}
 </span>
 </button>
 );
 })}
 </div>

 {/* Inline Custom Days Input */}
 <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
 <span className="text-xs font-extrabold text-slate-700">
 Özel Gün Belirle (1-30):
 </span>
 <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1 border border-slate-200 shadow-xs">
 <input
 type="number"
 min="1"
 max="30"
 value={days}
 onChange={handleDaysChange}
 className="w-10 bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none text-right "
 />
 <span className="text-xs font-bold text-slate-400">Gün</span>
 </div>
 </div>
 </div>

 {/* Agreements Section */}
 <div className="pt-2 border-t border-slate-100">
 <PaymentAgreementsSection 
 acceptedAgreements={acceptedAgreements} 
 onToggle={onAgreementToggle} 
 onRequiredAgreementsChange={onRequiredAgreementsChange} 
 />
 </div>

 {/* Embedded Payment Actions */}
 <div className="pt-2">
 <ShowcasePayment 
 ref={showcasePaymentRef} 
 embedded 
 listingId={listingId} 
 listingTitle={listing?.title || listingTitle} 
 days={days} 
 totalCost={totalCost} 
 showcasePricing={showcasePricing} 
 calculateSubtotal={calculateSubtotal} 
 calculateTax={calculateTax} 
 onSuccess={() => {
 setSuccessSummary({
 title: listing?.title || listingTitle,
 days
 });
 setShowSuccessNotification(true);
 onSuccess?.();
 }} 
 onError={(error) => {
 if (error.response?.data?.error === 'SHOWCASE_SLOT_LIMIT_EXCEEDED' || error.errorCode === 'SHOWCASE_SLOT_LIMIT_EXCEEDED') {
 setShowUpgradeModal(true);
 setUpgradeHint('Showcase slot limitinize ulaştınız.');
 return true;
 }
 return false;
 }} 
 onClose={onClose} 
 acceptedAgreements={acceptedAgreements} 
 getAcceptedAgreementIds={getAcceptedAgreementIds} 
 isExtension={isExtension} 
 showcaseId={showcaseId} 
 />
 </div>
 </div>
 </div>
 </div>
 );
 };

 if (!isOpen && !showSuccessNotification) return null;

 const successTitle = successSummary?.title ?? listing?.title ?? listingTitle;
 const successDays = successSummary?.days ?? days;

 const renderModalContent = () => {
 if (showSuccessNotification) return null;

 // Limit Pre-Check Loading
 if (isCheckingLimit || isListingLoading) {
 return (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-200">
 <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
 <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
 </div>
 <p className="text-xs font-extrabold text-slate-900">Vitrin Hakları Kontrol Ediliyor...</p>
 </div>
 </div>
 );
 }

 // Limit Pre-Check Warning View
 if (limitExceeded && !isExtension) {
 return (
 <AnimatePresence>
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center"
 >
 <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-700 shadow-xs">
 <Crown className="w-7 h-7" />
 </div>
 <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-2">Vitrin Limitine Ulaştınız</h3>
 <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
 Mevcut <strong className="text-slate-900">{plan}</strong> planınız maksimum <strong className="text-slate-900">{maxShowcaseSlots} vitrin ilanına</strong> izin vermektedir (Şu an aktif: {activeShowcaseCount}). Daha fazla ilan öne çıkarmak için planınızı yükseltebilirsiniz.
 </p>

 <div className="flex flex-col sm:flex-row items-center gap-2.5">
 <button
 onClick={onClose}
 className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
 >
 Vazgeç
 </button>
 <button
 onClick={() => {
 setUpgradeHint(`Planınız (${plan}) vitrin limitine ulaştı.`);
 setShowUpgradeModal(true);
 }}
 className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
 >
 <Crown className="w-4 h-4" />
 Plan Yükselt
 </button>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
 }

 if (!listingId || listingError || !listing) {
 return (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-200">
 <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
 <AlertCircle className="w-6 h-6 text-rose-500" />
 </div>
 <h2 className="text-sm font-extrabold text-slate-900 mb-1">{t("something_went_wrong")}</h2>
 <p className="text-xs text-slate-500 mb-6">{listingError || 'İlan bulunamadı.'}</p>
 <button 
 className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer" 
 onClick={onClose}
 >
 {t("close")}
 </button>
 </div>
 </div>
 );
 }

 return (
 <AnimatePresence>
 <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
 <motion.div 
 initial={{ opacity: 0, scale: 0.97, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.97, y: 10 }}
 transition={{ type: 'spring', damping: 28, stiffness: 320 }}
 className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto"
 >
 {/* Close Button top-right absolute */}
 <button 
 onClick={onClose} 
 className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer shadow-xs"
 >
 <X className="w-4 h-4" />
 </button>

 {/* 2-Column Stripe / Apple Checkout Unified Body */}
 {renderUnifiedCheckout()}
 </motion.div>
 </div>
 </AnimatePresence>
 );
 };

 const modalContent = (
 <>
 {isOpen ? renderModalContent() : null}
 {showSuccessNotification && (
 <ShowcaseSuccessModal 
 isOpen={showSuccessNotification} 
 onClose={() => {
 setShowSuccessNotification(false);
 setSuccessSummary(null);
 onClose?.();
 }} 
 listingId={listingId}
 listingTitle={successTitle}
 days={successDays}
 isExtension={isExtension}
 listingImage={listing?.images?.[0] || null}
 />
 )}
 <PremiumUpgradeModal
 isOpen={showUpgradeModal}
 onClose={() => setShowUpgradeModal(false)}
 featureHint={upgradeHint}
 />
 </>
 );

 return ReactDOM.createPortal(modalContent, document.body);
};

export default ShowcaseModal;