import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useUserReviewStats } from '../../reviews/index.js';

const ProfileQuickActions = ({ user }) => {
  const reviewsSectionRef = useRef(null);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  
  const shouldLoadReviews = reviewsVisible;
  const { stats: reviewStats, loading: reviewStatsLoading } = useUserReviewStats(user?.id, { 
    enabled: shouldLoadReviews 
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
      { threshold: 0.1 }
    );

    if (reviewsSectionRef.current) {
      observer.observe(reviewsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Quick Actions
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Access frequently used features and settings
        </p>
      </div>
      <div className="p-6 space-y-2">
        <ProfileLink
          to={ROUTES.MY_ORDERS}
          label="My Orders"
          description="View and track your order history"
          iconPath="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />

        <div ref={reviewsSectionRef} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Reviews & Ratings
              </h3>
              <p className="text-sm text-gray-600">
                {reviewStatsLoading ? 'Loading review data...' : 
                 reviewStats ? `${reviewStats.totalReviews || 0} reviews, ${(reviewStats.averageRating || 0).toFixed(1)} avg rating` :
                 'Manage your review activity'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to={ROUTES.REVIEWS_RECEIVED(user?.id)}
              className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>Reviews I Received</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              to={ROUTES.REVIEWS_GIVEN(user?.id)}
              className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>Reviews I Gave</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        <ProfileLink
          to={ROUTES.AGREEMENTS_ALL}
          label="Terms & Agreements"
          description="View legal documents and agreements"
          iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />

        <ProfileLink
          to={ROUTES.COMPLAINTS}
          label="Support & Complaints"
          description="Get help or file a complaint"
          iconPath="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75c0-1.856-.513-3.596-1.406-5.1l-4.5 4.5a9.75 9.75 0 01-3.844-3.844l4.5-4.5c-1.504-.893-3.244-1.406-5.1-1.406z"
        />

        <ProfileLink
          to={ROUTES.SECURITY}
          label="Security Settings"
          description="Manage password and security options"
          iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </div>
    </div>
  );
};

const ProfileLink = ({ to, label, description, iconPath }) => (
  <Link
    to={to}
    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors group"
  >
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPath}
        />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-900">{label}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <svg
      className="w-4 h-4 text-gray-400 ml-auto"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

export default ProfileQuickActions;
