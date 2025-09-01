import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useListingStatistics } from '../listing/hooks/useListingStatistics.js';
import { ROUTES } from '../common/constants/routes.js';
import ListingCategories from '../listing/components/ListingCategories.jsx';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const { statistics, isLoading: statsLoading } = useListingStatistics();

    return (
        <div className="min-h-screen bg-gray-50">
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

            {/* Quick Stats Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { label: 'Active Listings', value: statistics?.activeListings || 0 },
                        { label: 'Active Sellers', value: statistics?.activeSellerCount || 0 },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center hover:scale-95 transform transition">
                            <div className="text-2xl font-bold text-gray-900">
                                {statsLoading ? '...' : stat.value}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
                    <Link to={ROUTES.LISTINGS} className="text-emerald-700 hover:text-emerald-800 font-medium">See all →</Link>
                </div>
                <ListingCategories />
            </div>
        </div>
    );
};

export default HomePage;
