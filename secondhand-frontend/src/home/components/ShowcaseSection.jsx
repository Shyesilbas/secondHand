import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import { ArrowRight, BookOpen, Building2, Car, Dumbbell, Laptop, LayoutGrid, MoreHorizontal, Shirt } from 'lucide-react';

const SHOWCASE_CATEGORY_TABS = [
  { value: 'ALL', labelKey: 'all', icon: LayoutGrid },
  { value: 'VEHICLE', labelKey: 'vehicles', icon: Car },
  { value: 'ELECTRONICS', labelKey: 'electronics', icon: Laptop },
  { value: 'REAL_ESTATE', labelKey: 'real_estate', icon: Building2 },
  { value: 'CLOTHING', labelKey: 'fashion', icon: Shirt },
  { value: 'BOOKS', labelKey: 'book', icon: BookOpen },
  { value: 'SPORTS', labelKey: 'sports', icon: Dumbbell },
  { value: 'OTHER', labelKey: 'other', icon: MoreHorizontal }
];

const normalizeListingType = listing => String(listing?.type || '').trim().toUpperCase();

const ShowcaseSection = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useState('ALL');
  const { showcases, loading: showcaseLoading } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 24
  });

  const filteredShowcases = useMemo(() => {
    if (!Array.isArray(showcases)) return [];
    if (activeTab === 'ALL') return showcases;
    return showcases.filter(s => normalizeListingType(s.listing) === activeTab);
  }, [showcases, activeTab]);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
      {/* Header - Quiet & Direct */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
            {t("featured_listings", "Vitrin İlanları")}
          </h2>
          <p className="text-text-secondary mt-1 text-sm font-normal">
            {t("discover_popular_items_and_top_picks_fro", "Öne çıkan ilanları ve popüler seçenekleri keşfedin.")}
          </p>
        </div>
        <Link
          to={ROUTES.LISTINGS}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors shrink-0"
        >
          <span>{t("view_all_marketplace", "Tüm İlanları Gör")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Categories Ribbon Tabs */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex gap-1.5 p-1 bg-background-secondary border border-border-light rounded w-fit">
          {SHOWCASE_CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-background-primary text-text-primary border border-border-light shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-text-muted'}`} strokeWidth={1.5} />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="min-h-72">
        {showcaseLoading ? (
          <SkeletonGrid count={12} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" />
        ) : showcases && showcases.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredShowcases.length > 0 ? (
              filteredShowcases.map(showcase => (
                <div key={showcase.id} className="relative">
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-sm bg-background-primary/95 text-xs font-medium text-text-secondary border border-border-light shadow-sm">
                      {t("featured", "Vitrin")}
                    </span>
                  </div>
                  <ListingCard
                    listing={showcase.listing}
                    showActions={false}
                    isOwner={user?.id === showcase.listing?.sellerId}
                    currentUserId={user?.id}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-background-secondary rounded border border-border-light">
                <p className="text-sm text-text-muted font-normal">
                  {t("no_items_found_in_this_category", "Bu kategoride öne çıkan ilan bulunamadı.")}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-background-secondary rounded border border-border-light">
            <p className="text-sm text-text-muted font-normal">
              {t("no_featured_items_available_at_the_momen", "Şu an için vitrinde listelenen ilan bulunmuyor.")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowcaseSection;