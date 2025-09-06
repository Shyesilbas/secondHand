import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import ContactSellerButton from '../chat/components/ContactSellerButton.jsx';
import { userService } from './services/userService.js';
import { useUserListings } from './hooks/useUserListings.js';
import { ROUTES } from '../common/constants/routes.js';
import { formatDateTime } from '../common/formatters.js';
import ComplaintButton from '../complaint/components/ComplaintButton.jsx';


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

    const { user, isLoading: userLoading, error: userError } = useUserProfile(userId);
    const { listings, isLoading: listingsLoading, error: listingsError } = useUserListings(userId);

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
        <div className="container mx-auto px-4 py-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-text-muted hover:text-text-primary transition-colors mb-2 md:mb-0"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Go Back
                    </button>
                    <h1 className="text-3xl font-bold text-text-primary">
                        {user.name} {user.surname} {isOwnProfile && <span className="text-sm text-text-muted">(You)</span>}
                    </h1>
                </div>

                {!isOwnProfile && (
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        <ComplaintButton
                            targetUserId={userId}
                            targetUserName={`${user.name} ${user.surname}`}
                            targetUser={user}
                            size="sm"
                        />
                        <ContactSellerButton
                            listing={{
                                id: `user-chat-${userId}`,
                                title: `Chat with ${user.name} ${user.surname}`,
                                sellerId: userId,
                                sellerName: user.name,
                                sellerSurname: user.surname
                            }}
                            className="text-text-secondary hover:text-text-primary"
                            isDirectChat={true}
                        />

                    </div>
                )}
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm font-semibold text-text-muted">Email</p>
                    <p className="mt-1 text-text-primary">{user.email || 'Not provided'}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-muted">Phone</p>
                    <p className="mt-1 text-text-primary">{user.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-muted">Gender</p>
                    <p className="mt-1 text-text-primary">{user.gender || 'Not provided'}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-muted">Account Verified</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.accountVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {user.accountVerified ? 'Verified' : 'Not Verified'}
                    </span>
                </div>
                <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-text-muted">Account Creation Date</p>
                    <p className="mt-1 text-text-primary">{user.accountCreationDate}</p>
                </div>
            </div>

            {/* Listings */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Listings ({listings.length})</h2>
                {listingsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse h-60 rounded-xl"></div>
                        ))}
                    </div>
                ) : listingsError ? (
                    <div className="text-center text-red-500">Failed to load listings.</div>
                ) : listings.length === 0 ? (
                    <div className="text-center text-text-muted">No listings available.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(listing => (
                            <Link
                                key={listing.id}
                                to={ROUTES.LISTING_DETAIL(listing.id)}
                                className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-text-primary truncate">{listing.title}</h3>
                                    <p className="text-green-600 font-bold mt-1">{listing.price} {listing.currency}</p>
                                    <p className="text-text-muted text-sm mt-1">{formatDate(listing.createdAt)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
