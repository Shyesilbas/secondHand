import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import HeroListingCard from './HeroListingCard.jsx';
import { ArrowRight, ShieldCheck, CreditCard, MessageSquare } from 'lucide-react';

const HeroSection = () => {
  const { showcases } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 40,
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

  return (
    <section className="bg-page-hero border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          {/* Left Column — Value Proposition */}
          <div className="max-w-xl flex-shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 w-fit mb-4">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Community Marketplace
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Buy and sell with people you can <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">trust.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg font-medium">
              Explore listings from verified sellers, compare prices, and trade safely using secure buluşma verification & direct chat — all in one place.
            </p>

            <div className="mt-8 flex items-center gap-3.5">
              <Link
                to={ROUTES.LISTINGS_PREFILTER}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Explore Listings
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={ROUTES.LISTINGS_PREFILTER_CREATE}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Start Selling
              </Link>
            </div>

            {/* Micro Benefits Grid */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-500">Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-500">Wallet Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-500">Direct Chat</span>
              </div>
            </div>
          </div>

          {/* Right Column — Stacked Card Concept (Desktop only to guarantee top mobile performance) */}
          <div className="hidden lg:relative lg:flex lg:items-center lg:justify-center w-[480px] h-[340px] flex-shrink-0">
            {featuredCards.length > 0 ? (
              featuredCards.map((listing, index) => {
                // Precise static premium spacing to prevent performance layout jumps
                const rotations = [-4, 2, -1];
                const translationsX = [-30, 20, 0];
                const translationsY = [-20, 10, 40];
                
                const style = {
                  position: 'absolute',
                  transform: `rotate(${rotations[index % 3]}deg) translate(${translationsX[index % 3]}px, ${translationsY[index % 3]}px)`,
                  zIndex: 10 + index,
                };

                return (
                  <HeroListingCard
                    key={listing.id}
                    listing={listing}
                    style={style}
                    className="wizard-card-lift"
                  />
                );
              })
            ) : (
              // Minimal elegant skeleton during lazy loads
              <div className="w-80 h-48 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-6 shadow-sm">
                <div className="text-slate-300 text-xs font-semibold">Loading Vitrin...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
