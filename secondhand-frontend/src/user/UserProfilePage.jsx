import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, List } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { userService } from './services/userService.js';
import { useUserListings } from './hooks/useUserListings.js';
import { useReviews, useUserReviewStats } from '../reviews/index.js';
import { useUserFavoriteLists, FavoriteListCard, FavoriteListModal } from '../favoritelist/index.js';
import ListingCard from '../listing/components/ListingCard.jsx';
import UserProfileHeader from './components/UserProfileHeader.jsx';
import UserReviews from './components/UserReviews.jsx';
import Pagination from '../common/components/ui/Pagination.jsx';

const TABS = [
    { key: 'listings', label: 'Listings' },
    { key: 'lists', label: 'Lists' },
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
    const [activeTab, setActiveTab] = useState('listings');
    const [showCreateListModal, setShowCreateListModal] = useState(false);

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
    const { stats: reviewStats } = useUserReviewStats(userId, { 
        enabled: true
    });

    const isOwnProfile = currentUser && String(currentUser.id) === String(userId);
    
    const { data: favoriteLists = [], isLoading: listsLoading, refetch: refetchLists } = useUserFavoriteLists(userId, isOwnProfile, {
        enabled: activeTab === 'lists'
    });

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
        <div className="min-h-screen bg-[#F8FAFC] tracking-tight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <UserProfileHeader
                  user={user}
                  isOwnProfile={isOwnProfile}
                  reviewStats={reviewStats}
                />

                <div className="mb-8 mt-10">
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="p-4">
                            <div className="relative flex bg-slate-100 rounded-2xl p-1.5">
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.key;
                                    
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`relative flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 tracking-tight ${
                                                isActive
                                                    ? 'text-indigo-600 bg-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div key={activeTab} className="opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
                    {activeTab === 'listings' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tighter">
                                                Listings {pagination.totalElements > 0 && <span className="text-slate-500 font-normal">({pagination.totalElements})</span>}
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-2 tracking-tight">All active listings by this user</p>
                                        </div>
                                        {!listingsLoading && pagination.totalElements > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-600 tracking-tight">Show:</span>
                                                <select 
                                                    value={pagination.size} 
                                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white tracking-tight"
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={15}>15</option>
                                                    <option value={20}>20</option>
                                                </select>
                                                <span className="text-sm text-slate-600 tracking-tight">per page</span>
                                            </div>
                                        )}
                                    </div>

                                    {listingsLoading ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                                                    <div className="aspect-video bg-slate-200"></div>
                                                    <div className="p-4 space-y-3">
                                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : listingsError ? (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">Failed to load listings</p>
                                            <p className="text-sm text-slate-500 tracking-tight">Please try again later</p>
                                        </div>
                                    ) : listings.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tighter">No listings available</h3>
                                            <p className="text-sm text-slate-500 tracking-tight">
                                                {isOwnProfile ? "You haven't created any listings yet" : "This user hasn't created any listings yet"}
                                            </p>
                                            {isOwnProfile && (
                                                <button
                                                    onClick={() => navigate('/listings/create')}
                                                    className="mt-6 px-6 py-3 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg tracking-tight"
                                                >
                                                    Create Your First Listing
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                                {listings.map(listing => (
                                                    <ListingCard
                                                        key={listing.id}
                                                        listing={listing}
                                                        showActions={false}
                                                    />
                                                ))}
                                            </div>
                                            {!listingsLoading && pagination.totalPages > 1 && (
                                                <div className="mt-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
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
                            </div>
                        </div>
                    )}

                    {activeTab === 'lists' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tighter">
                                                Lists {favoriteLists.length > 0 && <span className="text-slate-500 font-normal">({favoriteLists.length})</span>}
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-2 tracking-tight">
                                                {isOwnProfile ? 'Your favorite lists' : 'Public favorite lists'}
                                            </p>
                                        </div>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => setShowCreateListModal(true)}
                                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-semibold tracking-tight"
                                            >
                                                <Plus className="w-4 h-4" />
                                                New List
                                            </button>
                                        )}
                                    </div>

                                    {listsLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden animate-pulse">
                                                    <div className="aspect-square bg-slate-200"></div>
                                                    <div className="p-5 space-y-3">
                                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : favoriteLists.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <List className="w-12 h-12 text-indigo-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tighter">No lists yet</h3>
                                            <p className="text-sm text-slate-500 mb-6 tracking-tight">
                                                {isOwnProfile 
                                                    ? "You haven't created any lists yet" 
                                                    : "This user hasn't shared any public lists yet"}
                                            </p>
                                            {isOwnProfile && (
                                                <button
                                                    onClick={() => setShowCreateListModal(true)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold tracking-tight"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    Create Your First List
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {favoriteLists.map(list => (
                                                <FavoriteListCard key={list.id} list={list} />
                                            ))}
                                            {isOwnProfile && (
                                                <button
                                                    onClick={() => setShowCreateListModal(true)}
                                                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                                                        <Plus className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 tracking-tight">New List</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
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
            
            <FavoriteListModal
                isOpen={showCreateListModal}
                onClose={() => setShowCreateListModal(false)}
                onSuccess={() => {
                    refetchLists();
                    setShowCreateListModal(false);
                }}
            />
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserProfilePage;
