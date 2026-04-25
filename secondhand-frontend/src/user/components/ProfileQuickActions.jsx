import React, {useRef, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useUserReviewStats} from '../../reviews/index.js';
import {ShoppingBag, Star, FileText, LifeBuoy, Shield, ChevronRight} from 'lucide-react';

const ProfileQuickActions = ({user}) => {
  const reviewsSectionRef = useRef(null);
  const [reviewsVisible, setReviewsVisible] = useState(false);

  const shouldLoadReviews = reviewsVisible;
  const {stats: reviewStats, loading: reviewStatsLoading} = useUserReviewStats(user?.id, {
    enabled: shouldLoadReviews,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setReviewsVisible(true);
            observer.disconnect();
          }
        });
      },
      {threshold: 0.1},
    );

    if (reviewsSectionRef.current) {
      observer.observe(reviewsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-2">
      <ActionLink
        to={ROUTES.MY_ORDERS}
        icon={ShoppingBag}
        label="My Orders"
        description="View and track your order history"
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
      />

      {/* Reviews section with lazy loading */}
      <div ref={reviewsSectionRef}>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3.5 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">Reviews & Ratings</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {reviewStatsLoading
                  ? 'Loading...'
                  : reviewStats
                    ? `${reviewStats.totalReviews || 0} reviews · ${(reviewStats.averageRating || 0).toFixed(1)} avg`
                    : 'Your review activity'}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-100">
            <Link
              to={ROUTES.REVIEWS_RECEIVED(user?.id)}
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
            >
              <span className="font-medium">Reviews I Received</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
            <Link
              to={ROUTES.REVIEWS_GIVEN(user?.id)}
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 border-t border-gray-100 group"
            >
              <span className="font-medium">Reviews I Gave</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          </div>
        </div>
      </div>

      <ActionLink
        to={ROUTES.AGREEMENTS_ALL}
        icon={FileText}
        label="Terms & Agreements"
        description="View legal documents and agreements"
        iconColor="text-violet-600"
        iconBg="bg-violet-50"
      />

      <ActionLink
        to={ROUTES.COMPLAINTS}
        icon={LifeBuoy}
        label="Support & Complaints"
        description="Get help or file a complaint"
        iconColor="text-rose-600"
        iconBg="bg-rose-50"
      />

      <ActionLink
        to={ROUTES.SECURITY}
        icon={Shield}
        label="Security Settings"
        description="Manage password and security options"
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
      />
    </div>
  );
};

const ActionLink = ({to, icon: Icon, label, description, iconColor = 'text-gray-600', iconBg = 'bg-gray-100'}) => (
  <Link
    to={to}
    className="flex items-center gap-3.5 px-4 py-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 group"
  >
    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 transition-colors duration-200`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
  </Link>
);

export default ProfileQuickActions;
