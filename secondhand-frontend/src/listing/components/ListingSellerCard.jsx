import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, Star } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { FollowButton } from '../../follow/index.js';
import { useUserReviewStats } from '../../reviews/hooks/useReviews.js';

// Compact seller summary shown under the buy box: identity, rating, membership and follow.
const ListingSellerCard = ({ listing, isOwner }) => {
  const { t } = useTranslation();
  const { stats, loading: isLoading } = useUserReviewStats(listing.sellerId, { enabled: Boolean(listing.sellerId) });

  const fullName = [listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ') || t('seller', 'Satıcı');
  const initial = (listing.sellerName?.[0] || 'S').toUpperCase();
  const memberSince = listing.sellerAccountCreationDate ? new Date(listing.sellerAccountCreationDate).getFullYear() : null;
  const reviewCount = Number(stats?.totalReviews ?? 0);
  const rating = Number(stats?.averageRating ?? 0);
  const profilePath = ROUTES.USER_PROFILE(listing.sellerId);

  return (
    <section className="rounded border border-border bg-background-primary p-5" aria-label={t('seller_information', 'Satıcı bilgileri')}>
      <div className="flex items-center justify-between gap-3">
        <Link to={profilePath} className="group flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-sm font-semibold text-text-primary">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-text-primary group-hover:underline">{fullName}</span>
            {memberSince && (
              <span className="block text-sm tabular-nums text-text-tertiary">
                {t('member_since_year', { defaultValue: '{{year}} yılından beri üye', year: memberSince })}
              </span>
            )}
          </span>
        </Link>
        {!isOwner && <FollowButton userId={listing.sellerId} size="sm" showDropdown />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border-light pt-4 text-sm">
        {isLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : reviewCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 tabular-nums text-text-primary">
            <Star className="h-4 w-4 fill-status-warning text-status-warning" strokeWidth={1.5} aria-hidden />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-text-tertiary">
              {t('review_count', { defaultValue: '({{count}} değerlendirme)', count: reviewCount })}
            </span>
          </span>
        ) : (
          <span className="text-text-tertiary">{t('no_seller_reviews_yet', 'Henüz değerlendirme yok')}</span>
        )}

        {listing.sellerGreatSellerEligible && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-status-warning-bg px-1.5 py-0.5 text-xs font-medium text-status-warning-text">
            <Award className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {t('great_seller_status', 'Harika satıcı')}
          </span>
        )}

        <Link
          to={profilePath}
          className="ml-auto inline-flex items-center gap-0.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          {t('seller_other_listings', 'Diğer ilanları')}
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </section>
  );
};

export default ListingSellerCard;
