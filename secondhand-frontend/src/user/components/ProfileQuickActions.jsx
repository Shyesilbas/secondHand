import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useUserReviewStats } from '../../reviews/index.js';
import { ShoppingBag, Star, FileText, LifeBuoy, Shield, ChevronRight } from 'lucide-react';
const ProfileQuickActions = ({
 user
}) => {
 const {
 t
 } = useTranslation();
 const reviewsSectionRef = useRef(null);
 const [reviewsVisible, setReviewsVisible] = useState(false);
 const shouldLoadReviews = reviewsVisible;
 const {
 stats: reviewStats,
 loading: reviewStatsLoading
 } = useUserReviewStats(user?.id, {
 enabled: shouldLoadReviews
 });
 useEffect(() => {
 const observer = new IntersectionObserver(entries => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 setReviewsVisible(true);
 observer.disconnect();
 }
 });
 }, {
 threshold: 0.1
 });
 if (reviewsSectionRef.current) {
 observer.observe(reviewsSectionRef.current);
 }
 return () => observer.disconnect();
 }, []);
 return <div className="space-y-2">
 <ActionLink to={ROUTES.MY_ORDERS} icon={ShoppingBag} label={t("my_orders")} description="View and track your order history" />

 {/* Reviews section with lazy loading */}
 <div ref={reviewsSectionRef}>
 <div className="rounded border border-border-light overflow-hidden">
 <div className="flex items-center gap-3.5 px-4 py-4">
 <Star className="shrink-0 h-5 w-5 text-status-warning" strokeWidth={1.5} aria-hidden />
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-medium text-text-primary">{t("reviews_ratings")}</h3>
 <p className="text-xs text-text-muted mt-0.5">
 {reviewStatsLoading ? 'Loading...' : reviewStats ? `${reviewStats.totalReviews || 0} reviews · ${(reviewStats.averageRating || 0).toFixed(1)} avg` : 'Your review activity'}
 </p>
 </div>
 </div>
 <div className="border-t border-border-light">
 <Link to={ROUTES.REVIEWS_RECEIVED(user?.id)} className="flex items-center justify-between px-4 py-3 text-sm text-text-secondary hover:bg-secondary transition-colors duration-150 group">
 <span className="font-medium">{t("reviews_i_received")}</span>
 <ChevronRight className="w-4 h-4 text-secondary-300 group-hover:text-text-muted transition-all duration-200" />
 </Link>
 <Link to={ROUTES.REVIEWS_GIVEN(user?.id)} className="flex items-center justify-between px-4 py-3 text-sm text-text-secondary hover:bg-secondary transition-colors duration-150 border-t border-border-light group">
 <span className="font-medium">{t("reviews_i_gave")}</span>
 <ChevronRight className="w-4 h-4 text-secondary-300 group-hover:text-text-muted transition-all duration-200" />
 </Link>
 </div>
 </div>
 </div>

 <ActionLink to={ROUTES.AGREEMENTS_ALL} icon={FileText} label={t("terms_agreements")} description="View legal documents and agreements" />

 <ActionLink to={ROUTES.COMPLAINTS} icon={LifeBuoy} label={t("support_complaints")} description="Get help or file a complaint" />

 <ActionLink to={ROUTES.SECURITY} icon={Shield} label={t("security_settings")} description="Manage password and security options" />
 </div>;
};
const ActionLink = ({
 to,
 icon: Icon,
 label,
 description
}) => <Link to={to} className="group flex items-center gap-3.5 rounded border border-border px-4 py-4 transition-colors hover:border-card-border-hover">
 <Icon className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-medium text-text-primary">{label}</h3>
 <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
 </div>
 <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-text-secondary" strokeWidth={1.5} aria-hidden />
 </Link>;
export default ProfileQuickActions;