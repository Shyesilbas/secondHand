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
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 to-emerald-600 text-white">
                <div className="max-w-6xl mx-auto px-6 py-24 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">SecondHand</h1>
                    <p className="text-lg md:text-xl text-emerald-200 mb-10">
                        Your secure marketplace for second-hand products
                    </p>
                    {isAuthenticated ? (
                        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                            <span className="text-lg md:text-xl">
                                Welcome, <span className="font-semibold">{user?.name}</span> 👋
                            </span>
                            <Link
                                to={ROUTES.CREATE_LISTING}
                                className="inline-block bg-white text-emerald-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
                            >
                                Publish Listing
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to={ROUTES.REGISTER}
                                className="inline-block bg-white text-emerald-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
                            >
                                Register
                            </Link>
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-block border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-emerald-700 transition"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Showcase Section */}
            {!showcaseLoading && showcases && showcases.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 py-16">
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
