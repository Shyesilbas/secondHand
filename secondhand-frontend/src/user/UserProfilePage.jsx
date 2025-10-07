import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import ContactSellerButton from '../chat/components/ContactSellerButton.jsx';
import { userService } from './services/userService.js';
import { useUserListings } from './hooks/useUserListings.js';
import { ROUTES } from '../common/constants/routes.js';
import { formatDateTime, formatCurrency } from '../common/formatters.js';
import ComplaintButton from '../complaint/components/ComplaintButton.jsx';
import { ReviewStats, ReviewsList, useReviews, useReviewsByUser, useUserReviewStats } from '../reviews/index.js';

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
    const { listings, isLoading: listingsLoading, error: listingsError } = useUserListings(userId);
    const { reviews: receivedReviews, loading: receivedReviewsLoading, error: receivedReviewsError, hasMore, loadMore } = useReviews(userId);
    const { reviews: givenReviews, loading: givenReviewsLoading, error: givenReviewsError } = useReviewsByUser(userId);
    const { stats: reviewStats, loading: reviewStatsLoading } = useUserReviewStats(userId, { 
        enabled: activeTab === 'reviews' 
    });

    const formatDate = (dateString) => formatDateTime(dateString);
    const isOwnProfile = currentUser?.id === userId;

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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Go Back
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {user.name} {user.surname} {isOwnProfile && <span className="text-sm text-gray-500">(You)</span>}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {isOwnProfile ? 'Your profile information and activity' : 'User profile and listings'}
                        </p>
                    </div>

                    {!isOwnProfile && (
                        <div className="flex gap-3">
                            <ContactSellerButton
                                listing={{
                                    id: `user-chat-${userId}`,
                                    title: `Chat with ${user.name} ${user.surname}`,
                                    sellerId: userId,
                                    sellerName: user.name,
                                    sellerSurname: user.surname
                                }}
                                isDirectChat={true}
                            />
                            <ComplaintButton
                                targetUserId={userId}
                                targetUserName={`${user.name} ${user.surname}`}
                                targetUser={user}
                            />
                        </div>
                    )}
                </div>

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
                    <div className="space-y-6">
                        {/* User Info Section */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-600 mt-1">Basic account details and contact information</p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField label="Email Address" value={user.email || 'Not provided'} />
                                    <InfoField label="Phone Number" value={user.phoneNumber || 'Not provided'} />
                                    <InfoField label="Gender" value={user.gender || 'Not specified'} />
                                    <InfoField 
                                        label="Account Status" 
                                        value={user.accountVerified ? 'Verified' : 'Not Verified'}
                                        isVerified={user.accountVerified}
                                    />
                                    <InfoField label="Member Since" value={user.accountCreationDate} />
                                </div>
                            </div>
                        </div>

                        {/* Compact Review Stats */}
                        {reviewStats && reviewStats.totalReviews > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Review Summary</h2>
                                </div>
                                <div className="p-6">
                                    <CompactReviewStats stats={reviewStats} loading={reviewStatsLoading} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Listings ({listings.length})</h2>
                            <p className="text-sm text-gray-600 mt-1">All listings by this user</p>
                        </div>
                        <div className="p-6">
                            {listingsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
                                    ))}
                                </div>
                            ) : listingsError ? (
                                <div className="text-center text-red-500 py-8">Failed to load listings.</div>
                            ) : listings.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No listings available.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {listings.map(listing => (
                                        <Link
                                            key={listing.id}
                                            to={ROUTES.LISTING_DETAIL(listing.id)}
                                            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                        >
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-green-600 font-bold mt-2 text-lg">
                                                    {formatCurrency(listing.price, listing.currency)}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                                    <span>{listing.type}</span>
                                                    <span>{formatDate(listing.createdAt)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {/* Reviews Received */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Reviews Received</h2>
                                <p className="text-sm text-gray-600 mt-1">Reviews this user has received from others</p>
                            </div>
                            <div className="p-6">
                                {reviewStats && reviewStats.totalReviews > 0 ? (
                                    <ReviewsList
                                        reviews={receivedReviews}
                                        loading={receivedReviewsLoading}
                                        error={receivedReviewsError}
                                        hasMore={hasMore}
                                        onLoadMore={loadMore}
                                    />
                                ) : (
                                    <div className="text-center text-gray-500 py-8">No reviews received yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Reviews Given */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Reviews Given</h2>
                                <p className="text-sm text-gray-600 mt-1">Reviews this user has given to others</p>
                            </div>
                            <div className="p-6">
                                {givenReviews && givenReviews.length > 0 ? (
                                    <ReviewsList
                                        reviews={givenReviews}
                                        loading={givenReviewsLoading}
                                        error={givenReviewsError}
                                        hasMore={false}
                                        onLoadMore={() => {}}
                                    />
                                ) : (
                                    <div className="text-center text-gray-500 py-8">No reviews given yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoField = ({ label, value, isVerified }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isVerified !== undefined ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isVerified
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
                {value}
            </span>
        ) : (
            <p className="text-gray-900">{value}</p>
        )}
    </div>
);

const CompactReviewStats = ({ stats, loading }) => {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return <p className="text-gray-500">No review information found.</p>;
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    {renderStars(Math.round(stats.averageRating || 0))}
                    <span className="text-lg font-semibold text-gray-900">
                        {(stats.averageRating || 0).toFixed(1)}
                    </span>
                </div>
                <span className="text-sm text-gray-600">
                    {stats.totalReviews || 0} reviews
                </span>
            </div>
        </div>
    );
};

export default UserProfilePage;
