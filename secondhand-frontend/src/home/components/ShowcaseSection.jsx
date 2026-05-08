import React, {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useShowcaseQueries} from '../../showcase/hooks/queries.js';
import {useAuthState} from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Car,
  Dumbbell,
  Laptop,
  LayoutGrid,
  MoreHorizontal,
  RefreshCw,
  Shirt,
} from 'lucide-react';

// ListingType ile hizalı; filtre tamamen frontend (listing.type üzerinden)
const SHOWCASE_CATEGORY_TABS = [
  { value: 'ALL', label: 'All', icon: LayoutGrid },
  { value: 'VEHICLE', label: 'Vehicle', icon: Car },
  { value: 'ELECTRONICS', label: 'Electronics', icon: Laptop },
  { value: 'REAL_ESTATE', label: 'Real Estate', icon: Building2 },
  { value: 'CLOTHING', label: 'Clothing', icon: Shirt },
  { value: 'BOOKS', label: 'Books', icon: BookOpen },
  { value: 'SPORTS', label: 'Sports', icon: Dumbbell },
  { value: 'OTHER', label: 'Other', icon: MoreHorizontal },
];

const normalizeListingType = (listing) => String(listing?.type || '').trim().toUpperCase();

const ShowcaseSection = () => {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useState('ALL');

  const { showcases, loading: showcaseLoading, error: showcaseError, refetch } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 72,
  });

  const tabCounts = useMemo(() => {
    const counts = { ALL: showcases.length };
    SHOWCASE_CATEGORY_TABS.forEach(({ value }) => {
      if (value === 'ALL') return;
      counts[value] = showcases.filter(
        (s) => normalizeListingType(s.listing) === value
      ).length;
    });
    return counts;
  }, [showcases]);

  const filteredShowcases = useMemo(() => {
    if (!Array.isArray(showcases)) return [];
    if (activeTab === 'ALL') return showcases;
    return showcases.filter((s) => normalizeListingType(s.listing) === activeTab);
  }, [showcases, activeTab]);

  return (
    <section className="py-14 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden border-t border-slate-100/90">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600/90 mb-1.5">
              Discover
            </p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured showcases</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Premium placements from sellers
            </p>
          </div>
          {showcases && showcases.length > 0 ? (
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-900/10 transition-colors"
            >
              Browse marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null}
        </div>

        <div className="mb-6 -mx-1 px-1">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory md:flex-wrap md:overflow-visible touch-pan-x">
            {SHOWCASE_CATEGORY_TABS.map(({ value, label, icon: Icon }) => {
              const count = tabCounts[value] ?? 0;
              const active = activeTab === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={`
                    snap-start shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border
                    ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-900/15'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-700'
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{label}</span>
                  <span
                    className={`
                      tabular-nums text-[10px] px-1.5 py-0.5 rounded-md font-bold
                      ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          {showcaseLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden animate-pulse shadow-sm min-w-0"
                >
                  <div className="aspect-[4/3] bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="w-16 h-3 bg-slate-100 rounded" />
                    <div className="w-3/4 h-4 bg-slate-100 rounded" />
                    <div className="w-full h-3 bg-slate-100 rounded" />
                    <div className="w-1/3 h-5 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : showcaseError ? (
            <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-sm text-slate-600 mb-4">Featured listings couldn&apos;t load.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : showcases && showcases.length > 0 ? (
            <>
              {!filteredShowcases.length ? (
                <div className="text-center py-16 rounded-[2rem] border border-dashed border-slate-200 bg-white">
                  <p className="text-sm text-slate-500">
                    No featured listings in this category right now — try another tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {filteredShowcases.map((showcase, index) => {
                    const listing = showcase.listing;
                    if (!listing) return null;

                    return (
                      <div key={showcase.id} className="min-w-0 max-w-full">
                        <ListingCard
                          listing={listing}
                          showActions={false}
                          isOwner={user?.id === listing.sellerId}
                          currentUserId={user?.id}
                          priorityImage={index < 6}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/80">
              <p className="text-sm text-slate-400">No featured showcases yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
