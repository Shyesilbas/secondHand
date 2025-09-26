import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROUTES } from '../common/constants/routes.js';
import ListingCategories from '../listing/components/ListingCategories.jsx';
import ShowcaseSection from '../showcase/ShowcaseSection.jsx';
import { useShowcaseQuery } from '../showcase/hooks/useShowcaseQuery.js';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const { showcases, loading: showcaseLoading } = useShowcaseQuery();

    // Removed manual event listener - React Query handles cache invalidation automatically

    return (
        <div className="min-h-screen bg-app-bg">
            {/* Showcase Section */}
            {!showcaseLoading && showcases && showcases.length > 0 && (
                <div className="bg-gray-50 pt-8 pb-16">
                    <ShowcaseSection showcases={showcases} />
                </div>
            )}

            {/* Categories Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-text-primary">Browse by Category</h2>
                    <Link to={ROUTES.LISTINGS} className="text-emerald-700 hover:text-emerald-800 font-medium">See all →</Link>
                </div>
                <ListingCategories />
            </div>
        </div>
    );
};

export default HomePage;
