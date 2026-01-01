import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';

const RecentListingsSection = () => {
  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['recentListings'],
    queryFn: async () => {
      const allListings = await get(API_ENDPOINTS.LISTINGS.ALL);
      return (Array.isArray(allListings) ? allListings : [])
        .filter(listing => listing.status === 'ACTIVE')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recently Added</h2>
            <p className="text-gray-600">
              Discover the latest items just added to our marketplace
            </p>
          </div>
          <Link
            to={ROUTES.LISTINGS}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            View All
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-center mt-8 sm:hidden">
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
            >
              View All Listings
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentListingsSection;

