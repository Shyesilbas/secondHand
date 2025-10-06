import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROUTES } from '../common/constants/routes.js';
import ListingCategories from '../listing/components/ListingCategories.jsx';
import ShowcaseSection from '../showcase/ShowcaseSection.jsx';
import { useShowcaseQuery } from '../showcase/hooks/useShowcaseQuery.js';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const { showcases, loading: showcaseLoading, error: showcaseError } = useShowcaseQuery();

    return (
        <div className="min-h-screen bg-white">
            {/* Showcase Section */}
            {!showcaseLoading && showcases && showcases.length > 0 && (
                <div className="bg-white pt-8 pb-16 border-b border-gray-200">
                    <ShowcaseSection showcases={showcases} />
                </div>
            )}

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
