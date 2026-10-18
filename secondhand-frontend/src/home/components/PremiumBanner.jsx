import { useState } from 'react';
import {useTranslation} from "react-i18next";
import {ArrowRight, Bot, Sparkles, Truck, Zap} from 'lucide-react';
import {usePlan} from '../../common/hooks/usePlan.js';
import PremiumUpgradeModal from '../../common/components/ui/PremiumUpgradeModal.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';

const PremiumBanner = () => {
 const { t } = useTranslation();
 const { isPremium, isLoading } = usePlan();
 const [showUpgrade, setShowUpgrade] = useState(false);

 if (isPremium) return null;

 return (
 <div className="bg-background-primary border-y border-border-light py-10 overflow-hidden relative">
 {/* Background decoration */}

 <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
 {isLoading ? (
 <Skeleton className="h-48 w-full" />
 ) : (
 <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
 <div className="flex-1 text-center lg:text-left">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
 <Sparkles className="w-3.5 h-3.5" />
 <span>{t("premium.banner.opportunity")}</span>
 </div>
 <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-4 leading-tight">
 {t("premium.banner.title_start")}<span className="text-primary">{t("premium.banner.title_highlight")}</span>
 </h2>
 <p className="text-text-secondary text-sm sm:text-base font-medium max-w-xl leading-relaxed mb-6">
 {t("premium.banner.description")}
 </p>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 <div className="flex items-center gap-3 bg-background-secondary p-3 rounded border border-border-light transition-colors hover:border-primary/30 group/item">
 <Zap className="shrink-0 h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden />
 <div className="text-left">
 <p className="text-xs font-semibold text-text-primary">{t("premium.banner.feature_fast_title")}</p>
 <p className="text-xs font-medium text-text-muted">{t("premium.banner.feature_fast_desc")}</p>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-background-secondary p-3 rounded border border-border-light transition-colors hover:border-status-success/30 group/item">
 <Truck className="shrink-0 h-5 w-5 text-status-success" strokeWidth={1.5} aria-hidden />
 <div className="text-left">
 <p className="text-xs font-semibold text-text-primary">{t("premium.banner.feature_shipping_title")}</p>
 <p className="text-xs font-medium text-text-muted">{t("premium.banner.feature_shipping_desc")}</p>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-background-secondary p-3 rounded border border-border-light transition-colors hover:border-primary/30 group/item">
 <Bot className="shrink-0 h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden />
 <div className="text-left">
 <p className="text-xs font-semibold text-text-primary">{t("premium.banner.feature_ai_title")}</p>
 <p className="text-xs font-medium text-text-muted">{t("premium.banner.feature_ai_desc")}</p>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-background-secondary p-3 rounded border border-border-light transition-colors hover:border-status-success/30 group/item">
 <Sparkles className="shrink-0 h-5 w-5 text-status-success" strokeWidth={1.5} aria-hidden />
 <div className="text-left">
 <p className="text-xs font-semibold text-text-primary">{t("premium.banner.feature_showcase_title")}</p>
 <p className="text-xs font-medium text-text-muted">{t("premium.banner.feature_showcase_desc")}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="shrink-0">
 <button
 onClick={() => setShowUpgrade(true)}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4"
 >
 {t("premium.banner.cta")}
 <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
 </button>
 </div>
 </div>
 )}
 </div>

 <PremiumUpgradeModal 
 isOpen={showUpgrade} 
 onClose={() => setShowUpgrade(false)} 
 featureHint="Homepage Banner"
 />
 </div>
 );
};

export default PremiumBanner;
