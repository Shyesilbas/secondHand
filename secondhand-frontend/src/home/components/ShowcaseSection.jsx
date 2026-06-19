import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Building2, Car, Dumbbell, Laptop, LayoutGrid, MoreHorizontal, RefreshCw, Shirt } from 'lucide-react';
const SHOWCASE_CATEGORY_TABS = [{
  value: 'ALL',
  label: 'All',
  icon: LayoutGrid
}, {
  value: 'VEHICLE',
  label: 'Vehicle',
  icon: Car
}, {
  value: 'ELECTRONICS',
  label: 'Electronics',
  icon: Laptop
}, {
  value: 'REAL_ESTATE',
  label: 'Real Estate',
  icon: Building2
}, {
  value: 'CLOTHING',
  label: 'Clothing',
  icon: Shirt
}, {
  value: 'BOOKS',
  label: 'Books',
  icon: BookOpen
}, {
  value: 'SPORTS',
  label: 'Sports',
  icon: Dumbbell
}, {
  value: 'OTHER',
  label: 'Other',
  icon: MoreHorizontal
}];
const normalizeListingType = listing => String(listing?.type || '').trim().toUpperCase();
const ShowcaseSection = () => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthState();
  const [activeTab, setActiveTab] = useState('ALL');
  const {
    showcases,
    loading: showcaseLoading,
    error: showcaseError,
    refetch
  } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 72
  });
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: showcases.length
    };
    SHOWCASE_CATEGORY_TABS.forEach(({
      value
    }) => {
      if (value === 'ALL') return;
      counts[value] = showcases.filter(s => normalizeListingType(s.listing) === value).length;
    });
    return counts;
  }, [showcases]);
  const filteredShowcases = useMemo(() => {
    if (!Array.isArray(showcases)) return [];
    if (activeTab === 'ALL') return showcases;
    return showcases.filter(s => normalizeListingType(s.listing) === activeTab);
  }, [showcases, activeTab]);
  return <section className="py-12 sm:py-14 bg-[#f5f7fb] border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header - Simpler & More Direct */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-2">{t("fresh_from_the_market")}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t("featured_listings")}</h2>
            <p className="text-slate-500 mt-2 max-w-xl text-sm font-medium">{t("discover_popular_items_and_top_picks_fro")}</p>
          </div>
          <Link to={ROUTES.LISTINGS} className="inline-flex w-fit items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <span>{t("view_all_marketplace")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories - Cleaner & Less 'Appy' */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 p-1 bg-slate-200/50 rounded-2xl w-fit">
            {SHOWCASE_CATEGORY_TABS.map(({
            value,
            label,
            icon: Icon
          }) => {
            const active = activeTab === value;
            return <button key={value} onClick={() => setActiveTab(value)} className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                    ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                  `}>
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </button>;
          })}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="min-h-[360px]">
          <AnimatePresence mode="wait">
            {showcaseLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => <div key={i} className="bg-slate-100 rounded-2xl aspect-[3/4] animate-pulse" />)}
              </div> : showcases && showcases.length > 0 ? <motion.div key={activeTab} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredShowcases.length > 0 ? filteredShowcases.map(showcase => <div key={showcase.id} className="relative">
                      {/* Subtle Badge instead of Flashy Zap */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[9px] font-bold text-slate-500 uppercase tracking-wider shadow-sm border border-slate-100">{t("featured")}</span>
                      </div>
                      <ListingCard listing={showcase.listing} showActions={false} isOwner={user?.id === showcase.listing.sellerId} currentUserId={user?.id} />
                    </div>) : <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
                    <p className="text-sm text-slate-400 font-medium">{t("no_items_found_in_this_category")}</p>
                  </div>}
              </motion.div> : <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">{t("no_featured_items_available_at_the_momen")}</p>
              </div>}
          </AnimatePresence>
        </div>
      </div>
    </section>;
};
export default ShowcaseSection;