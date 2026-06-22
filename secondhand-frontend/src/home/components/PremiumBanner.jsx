import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {ArrowRight, Bot, Sparkles, Truck, Zap} from 'lucide-react';
import {usePlan} from '../../common/hooks/usePlan.js';
import PremiumUpgradeModal from '../../common/components/ui/PremiumUpgradeModal.jsx';

const PremiumBanner = () => {
  const { t } = useTranslation();
  const { isPremium, isLoading } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isPremium) return null;

  return (
    <div className="bg-background-primary border-y border-border-light py-10 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {isLoading ? (
          <div className="h-48 bg-background-secondary animate-pulse rounded-3xl border border-border-light flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary/20 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-caption font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("premium.banner.opportunity")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-4 leading-tight">
                {t("premium.banner.title_start")}<span className="text-primary">{t("premium.banner.title_highlight")}</span>
              </h2>
              <p className="text-text-secondary text-sm sm:text-base font-medium max-w-xl leading-relaxed mb-6">
                {t("premium.banner.description")}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-background-secondary p-3 rounded-xl border border-border-light transition-colors hover:border-primary/30 group/item">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text-primary uppercase">{t("premium.banner.feature_fast_title")}</p>
                    <p className="text-[10px] font-medium text-text-muted">{t("premium.banner.feature_fast_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-background-secondary p-3 rounded-xl border border-border-light transition-colors hover:border-status-success/30 group/item">
                  <div className="w-10 h-10 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center shrink-0 group-hover/item:bg-status-success group-hover/item:text-white transition-colors">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text-primary uppercase">{t("premium.banner.feature_shipping_title")}</p>
                    <p className="text-[10px] font-medium text-text-muted">{t("premium.banner.feature_shipping_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-background-secondary p-3 rounded-xl border border-border-light transition-colors hover:border-primary/30 group/item">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text-primary uppercase">{t("premium.banner.feature_ai_title")}</p>
                    <p className="text-[10px] font-medium text-text-muted">{t("premium.banner.feature_ai_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-background-secondary p-3 rounded-xl border border-border-light transition-colors hover:border-status-success/30 group/item">
                  <div className="w-10 h-10 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center shrink-0 group-hover/item:bg-status-success group-hover/item:text-white transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text-primary uppercase">{t("premium.banner.feature_showcase_title")}</p>
                    <p className="text-[10px] font-medium text-text-muted">{t("premium.banner.feature_showcase_desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => setShowUpgrade(true)}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 group/btn"
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
