import { useTranslation } from "react-i18next";
import React, { memo, useMemo } from 'react';
import ListingCard from './ListingCard.jsx';
import { SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { AlertCircle as ExclamationCircleIcon, Image as PhotoIcon } from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';
const ListingGrid = memo(({
  listings,
  isLoading,
  error,
  onDeleted,
  isSelectable = false,
  selectedIds = new Set(),
  onSelectToggle = null
}) => {
  const { t } = useTranslation();
  const {
    user
  } = useAuthState();
  const {
    showcases
  } = useShowcase();
  const showcaseListingIds = useMemo(() => {
    if (!Array.isArray(showcases) || showcases.length === 0) return new Set();
    return new Set(showcases.map(s => s?.listing?.id || s?.listingId).filter(Boolean));
  }, [showcases]);
  if (isLoading) {
    return <SkeletonGrid count={10} columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8" />;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-[320px]">
                <div className="max-w-md w-full">
                    <EmptyState icon={ExclamationCircleIcon} title={t("listings_did_not_load")} description={error} primaryAction={{
          label: 'Try Again',
          onClick: () => window.location.reload()
        }} variant="error" className="w-full" />
                </div>
            </div>;
  }
  if (!listings || listings.length === 0) {
    return <div className="flex items-center justify-center min-h-[320px]">
                <div className="max-w-md w-full">
                    <EmptyState icon={PhotoIcon} title={t("no_listings_found")} description="No listings found for the criteria." className="w-full" />
                </div>
            </div>;
  }
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} onDeleted={onDeleted} isOwner={user?.id === listing.sellerId} currentUserId={user?.id} isInShowcase={showcaseListingIds.has(listing.id)} priorityImage={index === 0} isSelectable={isSelectable} isSelected={selectedIds.has(listing.id)} onSelectToggle={onSelectToggle} />)}
        </div>;
});
ListingGrid.displayName = 'ListingGrid';
export default ListingGrid;