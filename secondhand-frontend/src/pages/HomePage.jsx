import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListingStatistics } from '../features/listings/hooks/useListingStatistics';
import { ROUTES } from '../constants/routes';
import ListingCategories from '../features/listings/components/ListingCategories';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const { statistics, isLoading: statsLoading } = useListingStatistics();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            SecondHand
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Secure address for the Second Hand market place
                        </p>
                        {isAuthenticated ? (
                            <div className="space-y-4">
                                <p className="text-lg">
                                    Welcome, <span className="font-semibold">{user?.name}</span>! 👋
                                </p>
                                <Link
                                    to={ROUTES.CREATE_LISTING}
                                    className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Publish Listing
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Register
                                </Link>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            (
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex justify-center items-center space-x-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {statsLoading ? '...' : (statistics?.activeListings || 0)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Active Listings
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-300"></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {statsLoading ? '...' : (statistics?.activeSellerCount || 0)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Active Sellers
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-300"></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {statsLoading ? '...' : (statistics?.activeCityCount || 0)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Cities
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
                    <Link to={ROUTES.LISTINGS} className="text-blue-600 hover:text-blue-700 font-medium">See all →</Link>
                </div>
                <ListingCategories />
            </div>
            </div>
    );
};

export default HomePage;