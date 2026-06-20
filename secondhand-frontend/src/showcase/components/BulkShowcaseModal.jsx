import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Search, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { showcaseService } from '../services/showcaseService.js';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
const BulkShowcaseModal = ({
  isOpen,
  onClose,
  selectedListings,
  onSuccess,
  pricing: externalPricing
}) => {
  const {
    t
  } = useTranslation();
  const [step, setStep] = useState(1);
  const [days, setDays] = useState(7);
  const [pricing, setPricing] = useState(externalPricing || null);
  const [loading, setLoading] = useState(!externalPricing);
  const {
    showSuccess,
    showError
  } = useNotification();
  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  } = useAgreementsState();
  useEffect(() => {
    if (externalPricing) {
      setPricing(externalPricing);
      setLoading(false);
      return;
    }
    const fetchPricing = async () => {
      try {
        const response = await showcaseService.getPricingConfig();
        setPricing(response);
      } catch (err) {
        showError('Error', 'Failed to fetch pricing configuration');
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchPricing();
  }, [isOpen, externalPricing]);
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);
  if (!isOpen) return null;

  // Ensure unique listings
  const uniqueListings = Array.from(new Map(selectedListings.map(l => [l.id, l])).values());
  const itemCount = uniqueListings.length;
  const unitPrice = pricing?.totalDailyCost || 0;
  const totalBeforeDiscount = unitPrice * days * itemCount;
  const hasDiscount = pricing && itemCount >= pricing.bulkDiscountThreshold;
  const discountAmount = hasDiscount ? totalBeforeDiscount * pricing.bulkDiscountPercentage / 100 : 0;
  const finalTotal = totalBeforeDiscount - discountAmount;
  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };
  const modalContent = <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-background-primary rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {step === 1 ? 'Boost Multiple Listings' : step === 2 ? 'Review Agreements' : 'Complete Payment'}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 1 ? 'Reach more buyers instantly' : step === 2 ? 'Please accept the required agreements' : 'Select payment method and verify'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Step Progress Bar */}
        <div className="px-8 pt-2 shrink-0">
           <div className="flex gap-2">
             {[1, 2, 3].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-slate-100'}`} />)}
           </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? <div className="flex flex-col items-center py-12">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-slate-500 font-medium">{t("calculating_best_prices")}</p>
            </div> : step === 3 ? <ShowcasePayment isBulk={true} listingIds={uniqueListings.map(l => l.id)} listingTitle={`Bulk Showcase Payment (${itemCount} Items)`} days={days} totalCost={finalTotal} showcasePricing={pricing} calculateSubtotal={() => (pricing?.dailyCost || 0) * days * itemCount} calculateTax={() => ((pricing?.totalDailyCost || 0) - (pricing?.dailyCost || 0)) * days * itemCount} onSuccess={() => {
          showSuccess('Success', 'Bulk showcase activated successfully!');
          onSuccess?.();
          onClose();
        }} onClose={() => setStep(2)} acceptedAgreements={acceptedAgreements} getAcceptedAgreementIds={getAcceptedAgreementIds} /> : step === 2 ? <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                 <PaymentAgreementsSection acceptedAgreements={acceptedAgreements} onToggle={onAgreementToggle} onRequiredAgreementsChange={onRequiredAgreementsChange} />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                 <button onClick={handleBack} className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-all">{t("back")}</button>
                 <button onClick={handleNext} disabled={!areAllAgreementsAccepted()} className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-40">{t("continue_to_payment")}</button>
              </div>
            </div> : <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              {/* Promotion Header */}
              {pricing && !hasDiscount && <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-background-primary/20 rounded-lg">
                      <Star className="w-5 h-5 fill-white" />
                    </div>
                    <h3 className="text-sm font-medium text-text-primary">{t("bulk_showcase_benefit")}</h3>
                  </div>
                  <p className="text-primary text-sm leading-relaxed">{t("add")}{pricing.bulkDiscountThreshold}{t("or_more_listings_to_get_an_instant")}<span className="font-bold text-white mx-1">{pricing.bulkDiscountPercentage}{t("discount")}</span>{t("on_your_total_showcase_fee")}</p>
                </div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Selection Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("selected_listings")}{itemCount})</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {uniqueListings.map(l => <div key={l.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-10 h-10 rounded-lg bg-background-primary overflow-hidden shrink-0 border border-border-light/50">
                            {l.imageUrl || l.images?.[0]?.url ? <img src={l.imageUrl || l.images[0].url} alt={l.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                <Search className="w-4 h-4" />
                              </div>}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate">{l.title}</span>
                        </div>)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("showcase_duration")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 14, 30].map(d => <button key={d} onClick={() => setDays(d)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${days === d ? 'bg-primary text-white border-primary shadow-md shadow-indigo-100' : 'bg-background-primary text-slate-600 border-border-light hover:border-slate-300'}`}>
                          {d}{t("days")}</button>)}
                    </div>
                  </div>
                </div>

                {/* Right: Summary */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>{t("base_price")}{itemCount}{t("x")}</span>
                      <span>{formatCurrency(totalBeforeDiscount, 'TRY')}</span>
                    </div>
                    {hasDiscount && <div className="flex justify-between text-sm text-status-success font-bold bg-status-success-bg p-3 rounded-xl border border-emerald-100 animate-in zoom-in-95">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 fill-emerald-600" />
                          <span>{pricing.bulkDiscountPercentage}{t("discount_applied")}</span>
                        </div>
                        <span>-{formatCurrency(discountAmount, 'TRY')}</span>
                      </div>}
                    {!hasDiscount && pricing && <div className="text-caption text-primary font-semibold bg-indigo-50 p-2 rounded-lg flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-indigo-600" />{t("add")}{pricing.bulkDiscountThreshold - itemCount}{t("more_to_unlock_discount")}</div>}
                    <div className="pt-3 border-t border-border-light flex justify-between items-end">
                      <span className="text-sm font-bold text-text-primary">{t("total_payable")}</span>
                      <span className="text-2xl font-bold text-text-primary">{formatCurrency(finalTotal, 'TRY')}</span>
                    </div>
                  </div>

                  <button onClick={handleNext} className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                    <ShieldCheck className="w-5 h-5" />{t("review_proceed")}</button>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
  return createPortal(modalContent, document.body);
};
export default BulkShowcaseModal;