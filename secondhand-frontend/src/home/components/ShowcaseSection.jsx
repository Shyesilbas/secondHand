import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { ArrowRight, RefreshCw } from 'lucide-react';

const ShowcaseSection = () => {
  const { user } = useAuthState();
  const { showcases, loading: showcaseLoading, error: showcaseError, refetch } = useShowcaseQueries({
    enabled: true
  });

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header — title left, link right */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Featured</h2>
          {showcases && showcases.length > 0 && (
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors group"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Content */}
        {showcaseLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4">
                  <div className="w-16 h-3 bg-gray-100 rounded mb-2.5" />
                  <div className="w-3/4 h-4 bg-gray-100 rounded mb-2" />
                  <div className="w-full h-3 bg-gray-100 rounded mb-3" />
                  <div className="w-1/3 h-5 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : showcaseError ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-gray-400 mb-3">Failed to load featured listings.</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : showcases && showcases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {showcases.slice(0, 10).map((showcase, index) => {
              const listing = showcase.listing;
              if (!listing) return null;

              return (
                <ListingCard
                  key={showcase.id}
                  listing={listing}
                  showActions={false}
                  isOwner={user?.id === listing.sellerId}
                  currentUserId={user?.id}
                  priorityImage={index === 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[13px] text-gray-400">No featured listings yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowcaseSection;
