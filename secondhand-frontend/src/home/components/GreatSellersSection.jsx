import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { userService } from '../../user/services/userService.js';
import { ArrowRight, Award, Star, CalendarDays } from 'lucide-react';
import GreatSellerRulesCallout from './GreatSellerRulesCallout.jsx';
import { SkeletonCard } from '../../common/components/ui/Skeleton.jsx';
const formatDate = dateStr => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric'
  });
};
const HeaderBlock = () => {
  const { t } = useTranslation();
  return (
    <div className="relative z-10 mb-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="max-w-2xl">
          <p className="text-caption font-bold uppercase tracking-[0.2em] text-text-muted mb-3">{t("community_spotlight")}</p>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("trust_verified_sellers")}</h2>
          <p className="text-base text-text-secondary mt-4 font-medium leading-relaxed">{t("high_performance_sellers_recognized_for_")}</p>
        </div>

        <Link to={ROUTES.LISTINGS} className="group inline-flex items-center justify-center gap-2 text-sm font-bold text-text-primary hover:text-primary transition-colors">{t("view_all_marketplace_listings")}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
const SellerCard = ({
  s
}) => {
  const {
    t
  } = useTranslation();
  const fullName = `${s.name || ''} ${s.surname || ''}`.trim() || 'Anonymous Seller';
  const initials = `${s.name?.[0] || ''}${s.surname?.[0] || ''}`.toUpperCase() || 'S';
  return <div>
      <Link to={ROUTES.USER_PROFILE(s.id)} className="group block bg-background-primary border border-border-light rounded-xl p-5 transition-all duration-300 hover:border-border hover:shadow-md">
        <div className="flex items-start gap-4">
          {/* Avatar - Calm Slate */}
          <div className="w-12 h-12 rounded-full bg-background-secondary border border-border-light flex items-center justify-center shrink-0 transition-colors group-hover:bg-background-tertiary">
            <span className="text-sm font-bold text-text-secondary">{initials}</span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-text-primary truncate mb-1 group- transition-colors">
              {fullName}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {/* Rating / Trust Score */}
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-status-warning fill-status-warning" />
                <span className="text-caption font-bold text-text-secondary">{s.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-caption text-text-muted font-medium">{t("score")}</span>
              </div>
              
              <div className="w-1 h-1 rounded-full bg-border-light" />
              
              {/* Join Date */}
              <div className="flex items-center gap-1 text-text-muted">
                <CalendarDays className="w-3 h-3" />
                <span className="text-caption font-medium">{formatDate(s.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Badge - Subtle */}
        <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
          <div className="flex items-center gap-1.5 py-0.5 px-2 bg-primary-light rounded-md">
            <Award className="w-3 h-3 text-primary" />
            <span className="text-caption font-bold uppercase tracking-wider text-primary">{t("great_seller")}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </div>;
};
const GreatSellersSection = () => {
  const {
    t
  } = useTranslation();
  const limit = 12;
  const {
    data: sellers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['greatSellersHome', limit],
    queryFn: () => userService.listGreatSellers(limit),
    staleTime: 10 * 60 * 1000
  });
  return <section className="py-20 bg-background-secondary border-y border-border-light">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <HeaderBlock />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />) : error ? <div className="col-span-full py-12 text-center text-text-muted text-sm italic">{t("unable_to_load_featured_sellers_at_this_")}</div> : !sellers.length ? <div className="col-span-full py-12 text-center text-text-muted text-sm">{t("new_community_verified_sellers_will_appe")}</div> : sellers.map((s) => <SellerCard key={s.id} s={s} />)}
        </div>

        <div className="mt-16">
          <GreatSellerRulesCallout />
        </div>
      </div>
    </section>;
};
export default GreatSellersSection;