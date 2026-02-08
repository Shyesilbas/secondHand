import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';

const ShowcaseSection = () => {
  const { user } = useAuthState();
  const [loadShowcases, setLoadShowcases] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  const { showcases, loading: showcaseLoading, error: showcaseError, refetch } = useShowcaseQueries({
    enabled: loadShowcases
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadShowcases) {
          setLoadShowcases(true);
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [loadShowcases]);

  const handleRetry = () => {
    refetch();
  };

  return (
    <section 
      ref={sectionRef} 
      className="py-20 border-b border-slate-100 relative overflow-hidden bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
              <svg className="w-7 h-7 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-4 text-slate-900 tracking-tight">
            Featured Listings
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 tracking-tight">
            Discover premium listings showcased by our trusted sellers
          </p>
        </div>

        {!loadShowcases ? (
          <div className="text-center py-16">
            <button
              onClick={() => setLoadShowcases(true)}
              className="inline-flex items-center px-10 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.02] tracking-tight"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Load Featured Listings
            </button>
          </div>
        ) : showcaseLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-200"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-16 h-4 bg-slate-200 rounded"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="w-3/4 h-5 bg-slate-200 rounded mb-2"></div>
                  <div className="w-full h-4 bg-slate-200 rounded mb-3"></div>
                  <div className="w-1/2 h-6 bg-slate-200 rounded mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-4 bg-slate-200 rounded"></div>
                    <div className="w-16 h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : showcaseError ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-slate-900 tracking-tight">
              Failed to Load Featured Listings
            </h3>
            <p className="mb-4 text-slate-600 tracking-tight">
              Something went wrong while loading the featured listings.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.02] tracking-tight"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : showcases && showcases.length > 0 ? (
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {showcases.slice(0, 6).map((showcase) => {
              const listing = showcase.listing;
              if (!listing) return null;
              
              return (
                <ListingCard
                  key={showcase.id}
                  listing={listing}
                  showActions={false}
                  isOwner={user?.id === listing.sellerId}
                  currentUserId={user?.id}
                />
              );
            })}
          </div>
        ) : null}

        {showcases && showcases.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to={ROUTES.LISTINGS}
              className="group inline-flex items-center px-10 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.02] tracking-tight"
            >
              View All Listings
              <svg className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowcaseSection;
