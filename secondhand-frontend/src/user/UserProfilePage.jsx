import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { userService } from './services/userService.js';
import { useUserListings } from './hooks/useUserListings.js';
import { useReviews, useUserReviewStats } from '../reviews/index.js';
import ListingCard from '../listing/components/ListingCard.jsx';
import UserProfileHeader from './components/UserProfileHeader.jsx';
import UserStats from './components/UserStats.jsx';
import UserReviews from './components/UserReviews.jsx';
import Pagination from '../common/components/ui/Pagination.jsx';

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'listings', label: 'Listings' },
    { key: 'reviews', label: 'Reviews' },
];

const useUserProfile = (userId) => {
    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await userService.getUserById(userId);
                if (response && response.id) {
                    setUser(response);
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) fetchUser();
        else setIsLoading(false);
    }, [userId]);

    return { user, isLoading, error };
};

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const { user, isLoading: userLoading, error: userError } = useUserProfile(userId);
    const { listings, isLoading: listingsLoading, error: listingsError, pagination, loadPage, handlePageSizeChange } = useUserListings(userId, {
        enabled: activeTab === 'listings',
        page: 0,
        size: 10
    });
    const { reviews: receivedReviews, loading: receivedReviewsLoading, error: receivedReviewsError, pagination: reviewsPagination, loadPage: loadReviewsPage, handlePageSizeChange: handleReviewsPageSizeChange } = useReviews(userId, {
        enabled: activeTab === 'reviews',
        page: 0,
        size: 10
    });
    const { stats: reviewStats, loading: reviewStatsLoading } = useUserReviewStats(userId, { 
        enabled: true // Always load for header display
    });

    const isOwnProfile = currentUser?.id === userId;

    const handlePageChange = (page) => {
        loadPage(page);
    };

    if (userLoading || !user) return <div className="text-center py-16 text-text-muted">Loading...</div>;

    if (userError || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{userError || 'User not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-btn-primary text-white px-6 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <UserProfileHeader
                  user={user}
                  isOwnProfile={isOwnProfile}
                  reviewStats={reviewStats}
                />

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <UserStats
                    user={user}
                    reviewStats={reviewStats}
                    reviewStatsLoading={reviewStatsLoading}
                  />
                )}

                {activeTab === 'listings' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Listings {pagination.totalElements > 0 && `(${pagination.totalElements})`}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">All active listings by this user</p>
                                    </div>
                                    {!listingsLoading && pagination.totalElements > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Show:</span>
                                            <select 
                                                value={pagination.size} 
                                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
                                                <option value={20}>20</option>
                                            </select>
                                            <span className="text-sm text-gray-600">per page</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        {listingsLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                                        <div className="aspect-video bg-gray-200"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : listingsError ? (
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="text-center text-red-500 py-12">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-lg font-medium mb-2">Failed to load listings</p>
                                    <p className="text-sm text-gray-500">Please try again later</p>
                                </div>
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="text-center text-gray-500 py-12">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-lg font-medium mb-2">No listings available</p>
                                    <p className="text-sm text-gray-400">
                                        {isOwnProfile ? "You haven't created any listings yet" : "This user hasn't created any listings yet"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {listings.map(listing => (
                                        <ListingCard
                                            key={listing.id}
                                            listing={listing}
                                            showActions={false} // Don't show edit/delete actions on other users' profiles
                                        />
                                    ))}
                                </div>
                                {!listingsLoading && pagination.totalPages > 1 && (
                                    <div className="mt-6 bg-white border border-gray-200 rounded-lg">
                                        <Pagination
                                            page={pagination.number}
                                            totalPages={pagination.totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                  <UserReviews
                    receivedReviews={receivedReviews}
                    receivedReviewsLoading={receivedReviewsLoading}
                    receivedReviewsError={receivedReviewsError}
                    pagination={reviewsPagination}
                    loadPage={loadReviewsPage}
                    handlePageSizeChange={handleReviewsPageSizeChange}
                    reviewStats={reviewStats}
                  />
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
