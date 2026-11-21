import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { userService } from '../../user/services/userService.js';
import { Award, Star } from 'lucide-react';
import GreatSellerRulesCallout from './GreatSellerRulesCallout.jsx';
import HomeSection from './HomeSection.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { formatMonthYear } from '../../common/formatters.js';

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4';
const CARD = 'rounded border border-border-light bg-background-primary p-5 shadow-sm';
const LIMIT = 12;

const SellerCard = ({ s }) => {
  const { t } = useTranslation();
  const fullName = `${s.name || ''} ${s.surname || ''}`.trim() || t('anonymous_seller');
  const initials = `${s.name?.[0] || ''}${s.surname?.[0] || ''}`.toUpperCase() || 'S';
  return (
    <Link
      to={ROUTES.USER_PROFILE(s.id)}
      className={`${CARD} group block transition duration-150 hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background-secondary text-sm font-semibold text-text-secondary">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-text-primary">{fullName}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-tertiary">
            <Star className="h-3.5 w-3.5 shrink-0 fill-status-warning text-status-warning" strokeWidth={1.5} aria-hidden />
            <span className="font-medium tabular-nums text-text-secondary">{s.averageRating?.toFixed(1) || '0.0'}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{formatMonthYear(s.createdAt)}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 border-t border-border-light pt-3 text-sm font-medium text-text-secondary">
        <Award className="h-4 w-4 shrink-0 text-accent-teal" strokeWidth={1.5} aria-hidden />
        {t("great_seller")}
      </div>
    </Link>
  );
};

// Mirrors SellerCard (avatar row, divider, badge row) so the grid does not jump on load.
const SellerCardSkeleton = () => (
  <div className={CARD} aria-hidden>
    <div className="flex items-center gap-3">
      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="mt-4 border-t border-border-light pt-3">
      <Skeleton className="h-5 w-1/3" />
    </div>
  </div>
);

const GreatSellersSection = () => {
  const { t } = useTranslation();
  const { data: sellers = [], isLoading, error } = useQuery({
    queryKey: ['greatSellersHome', LIMIT],
    queryFn: () => userService.listGreatSellers(LIMIT),
    staleTime: 10 * 60 * 1000
  });

  let body;
  if (isLoading) {
    body = <div className={GRID} aria-busy="true">{Array.from({ length: 8 }, (_, i) => <SellerCardSkeleton key={i} />)}</div>;
  } else if (error || !sellers.length) {
    body = (
      <p className={`${CARD} py-10 text-center text-sm text-text-secondary`}>
        {error ? t("unable_to_load_featured_sellers_at_this_") : t("new_community_verified_sellers_will_appe")}
      </p>
    );
  } else {
    body = <div className={GRID}>{sellers.map((s) => <SellerCard key={s.id} s={s} />)}</div>;
  }

  return (
    <HomeSection
      title={t("trust_verified_sellers")}
      description={t("high_performance_sellers_recognized_for_")}
      linkTo={ROUTES.LISTINGS}
      linkLabel={t("view_all_marketplace_listings")}
    >
      {body}
      <GreatSellerRulesCallout className="mt-8" />
    </HomeSection>
  );
};

export default GreatSellersSection;
