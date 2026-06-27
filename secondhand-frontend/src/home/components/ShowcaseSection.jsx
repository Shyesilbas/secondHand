import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import { ArrowRight, BookOpen, Building2, Car, Dumbbell, Laptop, LayoutGrid, MoreHorizontal, Shirt } from 'lucide-react';
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
    loading: showcaseLoading
  } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 24
  });
  const filteredShowcases = useMemo(() => {
    if (!Array.isArray(showcases)) return [];
    if (activeTab === 'ALL') return showcases;
    return showcases.filter(s => normalizeListingType(s.listing) === activeTab);
  }, [showcases, activeTab]);
  return <section className="py-12 sm:py-14 bg-background-secondary border-y border-border-light">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header - Simpler & More Direct */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
          <div>
            <p className="text-caption font-bold uppercase tracking-[0.2em] text-primary mb-2">{t("fresh_from_the_market")}</p>
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("featured_listings")}</h2>
            <p className="text-text-secondary mt-2 max-w-xl text-sm font-medium">{t("discover_popular_items_and_top_picks_fro")}</p>
          </div>
          <Link to={ROUTES.LISTINGS} className="inline-flex w-fit items-center gap-2 px-4 py-2.5 bg-secondary-light hover:bg-secondary text-primary rounded-lg font-bold text-sm transition-all active:scale-95 shadow-sm">
            <span>{t("view_all_marketplace")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories - Cleaner & Less 'Appy' */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 p-1 bg-background-tertiary rounded-lg w-fit">
            {SHOWCASE_CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.value;
              return <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                      ${active ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}
                    `}>
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-text-muted'}`} />
                    <span>{tab.label}</span>
                  </button>;
            })}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="min-h-[360px]">
          {showcaseLoading ? (
            <SkeletonGrid count={12} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" />
          ) : showcases && showcases.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredShowcases.length > 0 ? filteredShowcases.map(showcase => (
                <div key={showcase.id} className="relative">
                  {/* Subtle Badge instead of Flashy Zap */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-1 rounded-md bg-background-primary text-caption font-bold text-text-secondary uppercase tracking-wider shadow-sm border border-border-light">{t("featured")}</span>
                  </div>
                  <ListingCard listing={showcase.listing} showActions={false} isOwner={user?.id === showcase.listing.sellerId} currentUserId={user?.id} />
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-background-primary rounded-xl border border-border-light">
                  <p className="text-sm text-text-muted font-medium">{t("no_items_found_in_this_category")}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-background-primary rounded-xl border border-dashed border-border-light">
              <p className="text-sm text-text-muted font-medium">{t("no_featured_items_available_at_the_momen")}</p>
            </div>
          )}
        </div>
      </div>
    </section>;
};
export default ShowcaseSection;