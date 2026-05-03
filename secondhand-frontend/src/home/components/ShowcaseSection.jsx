import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ShowcaseSection = () => {
  const { user } = useAuthState();
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { showcases, loading: showcaseLoading, error: showcaseError, refetch } = useShowcaseQueries({
    enabled: true
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showcases]);

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured</h2>
            <p className="text-sm text-slate-500 mt-1">Handpicked premium listings just for you.</p>
          </div>
          {showcases && showcases.length > 0 && (
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group bg-indigo-50 px-4 py-2 rounded-full"
            >
              View all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Content with Slider logic */}
        <div className="relative group/slider">
          {showcaseLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-50" />
                  <div className="p-4">
                    <div className="w-16 h-3 bg-slate-50 rounded mb-2.5" />
                    <div className="w-3/4 h-4 bg-slate-50 rounded mb-2" />
                    <div className="w-full h-3 bg-slate-50 rounded mb-3" />
                    <div className="w-1/3 h-5 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : showcaseError ? (
            <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 mb-4">Failed to load featured listings.</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading
              </button>
            </div>
          ) : showcases && showcases.length > 0 ? (
            <>
              {/* Navigation Buttons */}
              {showLeftArrow && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {showRightArrow && showcases.length > 5 && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Scrollable Container */}
              <div 
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-1 px-1 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {showcases.map((showcase, index) => {
                  const listing = showcase.listing;
                  if (!listing) return null;

                  return (
                    <div key={showcase.id} className="min-w-[calc(50%-10px)] md:min-w-[calc(33.333%-14px)] lg:min-w-[calc(25%-15px)] xl:min-w-[calc(20%-16px)] snap-start">
                      <ListingCard
                        listing={listing}
                        showActions={false}
                        isOwner={user?.id === listing.sellerId}
                        currentUserId={user?.id}
                        priorityImage={index < 5}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-sm text-slate-400">No featured listings yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
