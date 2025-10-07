import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROUTES } from '../common/constants/routes.js';
import ListingCategories from '../listing/components/ListingCategories.jsx';
import ShowcaseSection from '../showcase/ShowcaseSection.jsx';
import { useShowcaseQuery } from '../showcase/hooks/useShowcaseQuery.js';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const [loadShowcases, setLoadShowcases] = useState(false);
    const { showcases, loading: showcaseLoading, error: showcaseError } = useShowcaseQuery({
        enabled: loadShowcases
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Showcase Section */}
            {!loadShowcases ? (
                <div className="bg-gray-50 pt-8 pb-16 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Featured Listings</h2>
                        <p className="text-gray-600 mb-6">Discover premium listings showcased by our sellers</p>
                        <button
                            onClick={() => setLoadShowcases(true)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Load Featured Listings
                        </button>
                    </div>
                </div>
            ) : showcaseLoading ? (
                <div className="bg-white pt-8 pb-16 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading featured listings...</p>
                    </div>
                </div>
            ) : showcases && showcases.length > 0 ? (
                <div className="bg-white pt-8 pb-16 border-b border-gray-200">
                    <ShowcaseSection showcases={showcases} />
                </div>
            ) : null}

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900">Browse by Category</h2>
                    <Link to={ROUTES.LISTINGS} className="text-gray-700 hover:text-gray-900 font-medium">See all →</Link>
                </div>
                <ListingCategories />
            </div>
        </div>
    );
};

export default HomePage;
