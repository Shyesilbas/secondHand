import { useTranslation } from "react-i18next";
import { memo, useMemo } from 'react';
import ListingCard from './ListingCard.jsx';
import { SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { AlertCircle as ExclamationCircleIcon, Image as PhotoIcon } from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';
import { useMyShowcases } from '../../showcase/hooks/useMyShowcases.js';
export const LISTING_GRID_COLUMNS = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
export const LISTING_GRID_GAP = 'gap-3 sm:gap-4 lg:gap-5';
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
    const {
        showcases: myShowcases = []
    } = useMyShowcases(user?.id, { enabled: Boolean(user?.id) });
    const showcaseListingIds = useMemo(() => {
        const ids = new Set();
        if (Array.isArray(showcases)) {
            showcases.forEach(s => {
                const id = s?.listing?.id || s?.listingId;
                if (id) ids.add(id);
            });
        }
        if (Array.isArray(myShowcases)) {
            myShowcases.forEach(s => {
                if (s?.status === 'ACTIVE') {
                    const id = s?.listing?.id || s?.listingId;
                    if (id) ids.add(id);
                }
            });
        }
        return ids;
    }, [showcases, myShowcases]);
    if (isLoading) {
        return <SkeletonGrid count={10} columns={LISTING_GRID_COLUMNS} gap={LISTING_GRID_GAP} />;
    }
    if (error) {
        return <div className="flex items-center justify-center min-h-80">
            <div className="max-w-md w-full">
                <EmptyState icon={ExclamationCircleIcon} title={t("listings_did_not_load")} description={error} primaryAction={{
                    label: t('try_again', 'Tekrar dene'),
                    onClick: () => window.location.reload()
                }} variant="error" className="w-full" />
            </div>
        </div>;
    }
    if (!listings || listings.length === 0) {
        return <div className="flex items-center justify-center min-h-80">
            <div className="max-w-md w-full">
                <EmptyState icon={PhotoIcon} title={t("no_listings_found")} description={t("no_listings_for_criteria", "Bu kriterlere uygun ilan bulunamadı.")} className="w-full" />
            </div>
        </div>;
    }
    return <div className={`grid ${LISTING_GRID_COLUMNS} ${LISTING_GRID_GAP}`}>
        {listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} onDeleted={onDeleted} isOwner={user?.id === listing.sellerId} currentUserId={user?.id} isInShowcase={showcaseListingIds.has(listing.id)} priorityImage={index === 0} isSelectable={isSelectable} isSelected={selectedIds.has(listing.id)} onSelectToggle={onSelectToggle} />)}
    </div>;
});
ListingGrid.displayName = 'ListingGrid';
export default ListingGrid;