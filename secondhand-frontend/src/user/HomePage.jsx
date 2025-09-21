import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROUTES } from '../common/constants/routes.js';
import ListingCategories from '../listing/components/ListingCategories.jsx';
import ShowcaseSection from '../showcase/ShowcaseSection.jsx';
import { useShowcase } from '../showcase/hooks/useShowcase.js';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const { showcases, loading: showcaseLoading, fetchShowcases } = useShowcase();

    React.useEffect(() => {
        const handler = () => fetchShowcases();
        window.addEventListener('showcases:refresh', handler);
        return () => window.removeEventListener('showcases:refresh', handler);
    }, [fetchShowcases]);

    return (
        <div className="min-h-screen bg-app-bg">
            {/* Showcase Section */}
            {!showcaseLoading && showcases && showcases.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50/50 pt-8 pb-20 relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
                    </div>
                    <div className="relative z-10">
                        <ShowcaseSection showcases={showcases} />
                    </div>
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
