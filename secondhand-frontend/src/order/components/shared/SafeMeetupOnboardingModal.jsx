import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { X, MapPin, ShieldCheck, QrCode, Wallet, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { cacheService } from '../../../common/services/cacheService';
const ONBOARDING_STEPS = [{
  id: 1,
  title: "Elden Güvenli Alışveriş",
  description: "Kargo beklemeden, kargo ücreti ödemeden yüz yüze güvenli alışveriş deneyimi. Para havuzda (Escrow) güvende tutulur; siz ürünü teslim alıp onaylamadan satıcıya aktarılmaz.",
  icon: ShieldCheck,
  color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 border-indigo-100",
  gradient: "from-indigo-600 to-violet-600"
}, {
  id: 2,
  title: "Buluşma Noktası Belirleme",
  description: "Sipariş verilirken ortak kararlaştırılan güvenli buluşma konumları (📍 Marmara Forum, Kadıköy İskele vb.) seçilir. Böylece nerede buluşacağınızı net olarak bilirsiniz.",
  icon: MapPin,
  color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-100",
  gradient: "from-amber-500 to-orange-600"
}, {
  id: 3,
  title: "Kod ve QR Doğrulama",
  description: "Buluşma anında alıcı kendi ekranındaki 5 dakikalık dynamic QR kodu veya 6 haneli PIN kodunu satıcıya gösterir. Satıcı kodu girerek teslimatı sisteme anında kaydeder.",
  icon: QrCode,
  color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100",
  gradient: "from-emerald-600 to-teal-600"
}, {
  id: 4,
  title: "Çift Onay & Cüzdana Aktarım",
  description: "Teslimat yapıldıktan sonra iki taraf da 'Ürünü elden teslim aldım/ettim' onay kutularını işaretleyip işlemi tamamlar. Escrow'daki para anında satıcının cüzdanına (wallet) aktarılır.",
  icon: Wallet,
  color: "from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-100",
  gradient: "from-rose-600 to-pink-600"
}];
export const SafeMeetupOnboardingModal = () => {
  const {
    t
  } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showClose, setShowClose] = useState(false);
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    // Check if user already completed the onboarding walkthrough
    const hasShown = cacheService.get('safe_meetup_onboarding_shown');
    if (hasShown !== 'true') {
      setIsOpen(true);
    }
  }, []);
  useEffect(() => {
    const handleOpenTrigger = () => {
      setIsOpen(true);
      setShowClose(true); // Let them close immediately if manually triggered
      setCountdown(0);
    };
    window.addEventListener('open-safe-meetup-onboarding', handleOpenTrigger);
    return () => window.removeEventListener('open-safe-meetup-onboarding', handleOpenTrigger);
  }, []);
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);
  const handleClose = () => {
    if (!showClose) return;
    cacheService.set('safe_meetup_onboarding_shown', 'true');
    setIsOpen(false);
  };
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  if (!isOpen) return null;
  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;
  return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/50 bg-[#faf9f7] p-8 shadow-2xl transition-all duration-300">
        
        {/* Floating Background Glows */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-indigo-100/40 relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">{t("yeni_zellik_tan_t_m")}</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">{t("elden_g_venli_teslimat")}</h3>
          </div>
          
          {/* Close Button - Hidden/Disabled for the first 5 seconds */}
          {showClose ? <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:scale-105 shadow-sm transition-all" aria-label={t("kapat")}>
              <X className="h-5 w-5" />
            </button> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold font-mono">
              {countdown}{t("s")}</div>}
        </div>

        {/* Step Cards with animation */}
        <div className="py-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Elegant Pulsing Icon Card */}
            <div className={`flex h-20 w-20 items-center justify-center rounded-[24px] border ${step.color} shadow-inner mb-6 animate-pulse`}>
              <StepIcon className="h-10 w-10" />
            </div>

            {/* Title & Description */}
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              {step.id}{t("ad_m")}{step.title}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              {step.description}
            </p>
          </div>
        </div>

        {/* Progress & Navigation Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-indigo-100/40 relative z-10">
          {/* Step Indicators */}
          <div className="flex gap-1.5">
            {ONBOARDING_STEPS.map((_, index) => <div key={index} className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'w-6 bg-slate-900' : 'w-2 bg-slate-200 hover:bg-slate-300 cursor-pointer'}`} onClick={() => setCurrentStep(index)} />)}
          </div>

          {/* Navigation Actions */}
          <div className="flex gap-2">
            {currentStep > 0 && <button type="button" onClick={handlePrev} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition">
                <ArrowLeft className="h-3.5 w-3.5" />{t("geri")}</button>}
            
            <button type="button" onClick={handleNext} className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white rounded-full bg-gradient-to-r ${step.gradient} hover:opacity-95 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5`}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? <>{t("ba_la")}<Check className="h-3.5 w-3.5" />
                </> : <>{t("i_leri")}<ArrowRight className="h-3.5 w-3.5" />
                </>}
            </button>
          </div>
        </div>

      </div>
    </div>;
};