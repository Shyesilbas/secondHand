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
    size: 24
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
  return <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80 text-slate-900">
      {/* Decorative Light Background Glowing Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center gap-10 lg:gap-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-700 uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />{t("curated_marketplace")}</span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider shadow-sm">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />{t("verified_trade")}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight leading-[1.08]">
              {t("find_better_deals_from_sellers_you_can_t")}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              {t("browse_vetted_listings_compare_real_pric")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <Link to={ROUTES.LISTINGS_PREFILTER} className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 border border-slate-200 shadow-sm hover:border-emerald-500 hover:text-slate-900 transition-all">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="truncate">{t("search_cars_phones_homes_fashion")}</span>
                <ArrowRight className="ml-auto w-4 h-4 text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>
              <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0">
                + {t("start_selling")}
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl">
              {[{
                icon: ShieldCheck,
                title: 'Verified Sellers',
                text: 'Escrow protected deals'
              }, {
                icon: CreditCard,
                title: 'Wallet Checkout',
                text: 'Zero commission hold'
              }, {
                icon: MessageSquare,
                title: 'Direct Chat',
                text: 'Instant offer feature'
              }].map((item) => {
                const Icon = item.icon;
                return <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{item.text}</p>
                  </div>
                </div>;
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[350px] lg:h-[440px]">
            <div className="absolute inset-x-2 bottom-2 top-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 shadow-2xl backdrop-blur-xl" />
            
            <div className="absolute left-6 top-4 rounded-2xl border border-emerald-500/30 bg-slate-900/90 px-4 py-2.5 backdrop-blur-md shadow-lg shadow-emerald-500/20 z-30">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">{t("live_picks")}</p>
              <p className="mt-0.5 text-xl font-black text-white">{featuredCards.length || 3} İlan</p>
            </div>
            
            <div className="absolute right-6 bottom-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90 px-4 py-2.5 backdrop-blur-md shadow-lg z-30">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">{t("safer_deals")}</p>
              <p className="mt-0.5 text-xs font-bold text-slate-200">{t("chat_checkout")}</p>
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
            }) : <div className="w-80 h-52 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center p-6 shadow-xl backdrop-blur-md">
                <div className="text-slate-400 text-xs font-bold tracking-wide animate-pulse">{t("loading_showcase")}</div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;