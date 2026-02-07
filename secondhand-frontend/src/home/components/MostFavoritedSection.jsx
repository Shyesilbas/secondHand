import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';

const MostFavoritedSection = () => {
  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['mostFavoritedListings'],
    queryFn: async () => {
      const response = await get(`${API_ENDPOINTS.FAVORITES.TOP_LISTINGS}?size=10`);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">Most Favorited</h2>
            <p className="text-lg text-slate-600 tracking-tight">
              Discover the most loved items in our marketplace
            </p>
          </div>
          <Link
            to={ROUTES.LISTINGS}
            className="group hidden sm:inline-flex items-center px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.02] tracking-tight"
          >
            View All
            <svg className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <ListingGrid 
          listings={listings} 
          isLoading={isLoading} 
          error={error?.message} 
        />

        {listings.length > 0 && (
          <div className="text-center mt-12 sm:hidden">
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

export default MostFavoritedSection;

