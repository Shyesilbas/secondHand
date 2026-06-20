import { useTranslation } from "react-i18next";
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import HeroListingCard from './HeroListingCard.jsx';
import { ArrowRight, BadgeCheck, CreditCard, MessageSquare, Search, ShieldCheck, Sparkles } from 'lucide-react';
const HeroSection = () => {
  const {
    t
  } = useTranslation();
  const {
    showcases
  } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 40
  });

  // Extract actual listings: 1 Vehicle, 1 Electronic, 1 Real Estate
  const featuredCards = useMemo(() => {
    if (!Array.isArray(showcases) || showcases.length === 0) return [];
    const vehicle = showcases.find(s => s.listing?.type === 'VEHICLE')?.listing;
    const electronic = showcases.find(s => s.listing?.type === 'ELECTRONICS')?.listing;
    const realEstate = showcases.find(s => s.listing?.type === 'REAL_ESTATE')?.listing;
    const cards = [];
    if (vehicle) cards.push(vehicle);
    if (electronic) cards.push(electronic);
    if (realEstate) cards.push(realEstate);

    // Fallback if we don't have exactly one of each, grab the first 3 featured listings
    if (cards.length < 3) {
      const existingIds = new Set(cards.map(c => c.id));
      showcases.forEach(s => {
        if (cards.length < 3 && s.listing && !existingIds.has(s.listing.id)) {
          cards.push(s.listing);
        }
      });
    }
    return cards;
  }, [showcases]);
  return <section className="relative overflow-hidden bg-page-hero border-b border-border-light/70">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(79,70,229,0.12),transparent_26%)]" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center gap-8 lg:gap-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-success-bg border border-emerald-100 text-caption font-bold text-emerald-700 uppercase tracking-[0.18em]">
                <Sparkles className="w-3 h-3" />{t("curated_marketplace")}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-primary/80 border border-border-light text-caption font-bold text-slate-500 uppercase tracking-[0.18em]">
                <BadgeCheck className="w-3 h-3 text-primary" />{t("verified_trade")}</span>
            </div>

            <h1 className="text-2xl font-semibold text-text-primary lg:text-[58px] tracking-tight leading-[0.98]">{t("find_better_deals_from_sellers_you_can_t")}</h1>
            <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">{t("browse_vetted_listings_compare_real_pric")}</p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <Link to={ROUTES.LISTINGS_PREFILTER} className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-background-primary px-4 py-3.5 text-sm font-semibold text-slate-500 border border-border-light shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] hover:border-slate-300 transition-all">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="truncate">{t("search_cars_phones_homes_fashion")}</span>
                <ArrowRight className="ml-auto w-4 h-4 text-text-primary transition-transform group-hover:translate-x-0.5 shrink-0" />
              </Link>
              <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-[0_16px_35px_-22px_rgba(15,23,42,0.9)]">{t("start_selling")}</Link>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              {[{
              icon: ShieldCheck,
              title: 'Verified Sellers',
              text: 'Identity checked profiles'
            }, {
              icon: CreditCard,
              title: 'Wallet Checkout',
              text: 'Safer payment flow'
            }, {
              icon: MessageSquare,
              title: 'Direct Chat',
              text: 'Fast offer negotiation'
            }].map(({
              icon: Icon,
              title,
              text
            }) => <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-background-primary/70 px-3 py-3 backdrop-blur">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body font-bold text-text-primary truncate">{title}</p>
                    <p className="text-caption font-medium text-slate-500 truncate">{text}</p>
                  </div>
                </div>)}
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[330px] lg:h-[430px]">
            <div className="absolute inset-x-4 bottom-4 top-10 rounded-[28px] bg-slate-950 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.65)]" />
            <div className="absolute left-4 top-5 rounded-2xl border border-white/10 bg-background-primary/10 px-4 py-3 text-white backdrop-blur">
              <p className="text-caption font-bold uppercase tracking-[0.18em] text-emerald-200">{t("live_picks")}</p>
              <p className="mt-1 text-2xl font-bold">{featuredCards.length || 3}</p>
            </div>
            <div className="absolute right-4 bottom-8 rounded-2xl border border-white/10 bg-background-primary/10 px-4 py-3 text-white backdrop-blur z-30">
              <p className="text-caption font-bold uppercase tracking-[0.18em] text-primary">{t("safer_deals")}</p>
              <p className="mt-1 text-sm font-bold">{t("chat_checkout")}</p>
            </div>
            <div className="relative flex items-center justify-center w-full h-[330px] lg:h-[390px]">
            {featuredCards.length > 0 ? featuredCards.map((listing, index) => {
              const rotations = [-5, 4, -1];
              const translationsX = [-70, 56, 0];
              const translationsY = [-24, 18, 62];
              const style = {
                position: 'absolute',
                transform: `rotate(${rotations[index % 3]}deg) translate(${translationsX[index % 3]}px, ${translationsY[index % 3]}px)`,
                zIndex: 10 + index
              };
              return <HeroListingCard key={listing.id} listing={listing} style={style} className="wizard-card-lift scale-[0.78] sm:scale-[0.86] lg:scale-100" />;
            }) : <div className="w-80 h-52 rounded-2xl bg-background-primary/95 border border-white/80 flex items-center justify-center p-6 shadow-sm">
                <div className="text-slate-400 text-xs font-semibold">{t("loading_showcase")}</div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;