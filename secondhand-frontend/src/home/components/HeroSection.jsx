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
  return <section className="relative overflow-hidden bg-page-hero border-b border-border-light">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center gap-8 lg:gap-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-success-bg border border-status-success-border text-caption font-bold text-status-success-text uppercase tracking-[0.18em]">
                <Sparkles className="w-3 h-3" />{t("curated_marketplace")}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-primary border border-border-light text-caption font-bold text-text-secondary uppercase tracking-[0.18em]">
                <BadgeCheck className="w-3 h-3 text-primary" />{t("verified_trade")}</span>
            </div>

            <h1 className="text-2xl font-semibold text-text-primary lg:text-4xl tracking-tight leading-[0.98]">{t("find_better_deals_from_sellers_you_can_t")}</h1>
            <p className="mt-5 text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl font-medium">{t("browse_vetted_listings_compare_real_pric")}</p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <Link to={ROUTES.LISTINGS_PREFILTER} className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-background-primary px-4 py-2.5 text-sm font-semibold text-text-muted border border-border-light shadow-sm hover:border-border transition-all">
                <Search className="w-5 h-5 text-text-muted shrink-0" />
                <span className="truncate">{t("search_cars_phones_homes_fashion")}</span>
                <ArrowRight className="ml-auto w-4 h-4 text-text-primary transition-transform group-hover:translate-x-0.5 shrink-0" />
              </Link>
              <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-sm">{t("start_selling")}</Link>
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
              }].map((item) => {
                const Icon = item.icon;
                return <div key={item.title} className="flex items-center gap-3 rounded-xl border border-border-light bg-background-primary px-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-background-secondary text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body font-bold text-text-primary truncate">{item.title}</p>
                    <p className="text-caption font-medium text-text-muted truncate">{item.text}</p>
                  </div>
                </div>;
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[330px] lg:h-[430px]">
            <div className="absolute inset-x-4 bottom-4 top-10 rounded-xl bg-background-dark shadow-sm" />
            <div className="absolute left-4 top-5 rounded-xl border border-border-dark bg-secondary-dark px-4 py-3 text-text-inverse">
              <p className="text-caption font-bold uppercase tracking-[0.18em] text-primary-300">{t("live_picks")}</p>
              <p className="mt-1 text-2xl font-bold">{featuredCards.length || 3}</p>
            </div>
            <div className="absolute right-4 bottom-8 rounded-xl border border-border-dark bg-secondary-dark px-4 py-3 text-text-inverse z-30">
              <p className="text-caption font-bold uppercase tracking-[0.18em] text-primary-300">{t("safer_deals")}</p>
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
            }) : <div className="w-80 h-52 rounded-xl bg-background-primary border border-border-light flex items-center justify-center p-6 shadow-sm">
                <div className="text-text-muted text-xs font-semibold">{t("loading_showcase")}</div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;