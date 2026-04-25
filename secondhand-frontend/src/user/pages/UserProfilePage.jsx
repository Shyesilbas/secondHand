import React, {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Plus, List, Package, Heart, Star, MessageSquare, ChevronRight, AlertCircle} from 'lucide-react';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {userService} from '../services/userService.js';
import {useUserListings} from '../hooks/useUserListings.js';
import {useReviews, useUserReviewStats} from '../../reviews/index.js';
import {useUserFavoriteLists, FavoriteListCard, FavoriteListModal} from '../../favoritelist/index.js';
import ListingCard from '../../listing/components/ListingCard.jsx';
import UserProfileHeader from '../components/UserProfileHeader.jsx';
import UserReviews from '../components/UserReviews.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import {ROUTES} from '../../common/constants/routes.js';

const TABS = [
    {key: 'listings', label: 'Listings', icon: Package},
    {key: 'lists', label: 'Lists', icon: Heart},
    {key: 'reviews', label: 'Reviews', icon: Star},
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

    return {user, isLoading, error};
};

const UserProfilePage = () => {
    const {userId} = useParams();
    const navigate = useNavigate();
    const {user: currentUser} = useAuthState();
    const [activeTab, setActiveTab] = useState('listings');
    const [showCreateListModal, setShowCreateListModal] = useState(false);

    const {user, isLoading: userLoading, error: userError} = useUserProfile(userId);
    const {listings, isLoading: listingsLoading, error: listingsError, pagination, loadPage, handlePageSizeChange} = useUserListings(userId, {
        enabled: activeTab === 'listings',
        page: 0,
        size: 12,
    });
    const {reviews: receivedReviews, loading: receivedReviewsLoading, error: receivedReviewsError, pagination: reviewsPagination, loadPage: loadReviewsPage, handlePageSizeChange: handleReviewsPageSizeChange} = useReviews(userId, {
        enabled: activeTab === 'reviews',
        page: 0,
        size: 10,
    });
    const {stats: reviewStats} = useUserReviewStats(userId, {enabled: true});

    const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

    const {data: favoriteLists = [], isLoading: listsLoading, refetch: refetchLists} = useUserFavoriteLists(userId, isOwnProfile, {
        enabled: activeTab === 'lists',
    });

    const handlePageChange = (page) => loadPage(page);

    // Loading state
    if (userLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (userError || !user) {
        return (
            <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">User not found</p>
                    <p className="text-sm text-gray-500 mb-6">{userError || 'The profile you\'re looking for doesn\'t exist.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/80">
            {/* ── Profile Header (full-width banner) ──────────── */}
            <UserProfileHeader
                user={user}
                isOwnProfile={isOwnProfile}
                reviewStats={reviewStats}
            />

            {/* ── Tab Bar ─────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 -mb-px">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            let count = null;
                            if (tab.key === 'listings' && pagination.totalElements > 0) count = pagination.totalElements;
                            if (tab.key === 'lists' && favoriteLists.length > 0) count = favoriteLists.length;
                            if (tab.key === 'reviews' && reviewStats?.totalReviews > 0) count = reviewStats.totalReviews;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                                        isActive
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {count !== null && (
                                        <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-bold tabular-nums ${
                                            isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ─────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div key={activeTab} className="animate-fadeIn">

                    {/* ── Listings Tab ─────────────────────────── */}
                    {activeTab === 'listings' && (
                        <div>
                            {/* Controls row */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                                        Listings
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {isOwnProfile ? 'Your active listings' : 'All active listings by this user'}
                                    </p>
                                </div>
                                {!listingsLoading && pagination.totalElements > 0 && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={pagination.size}
                                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                            className="h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 cursor-pointer"
                                        >
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                        </select>
                                        <span className="text-xs text-gray-400 font-medium">per page</span>
                                    </div>
                                )}
                            </div>

                            {listingsLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                                            <div className="aspect-square bg-gray-100" />
                                            <div className="p-3.5 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : listingsError ? (
                                <EmptyState
                                    icon={AlertCircle}
                                    iconColor="text-red-500"
                                    iconBg="bg-red-50"
                                    title="Failed to load listings"
                                    description="Please try again later"
                                />
                            ) : listings.length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="No listings yet"
                                    description={isOwnProfile ? "You haven't created any listings yet" : "This user hasn't created any listings yet"}
                                    action={isOwnProfile ? {label: 'Create Listing', onClick: () => navigate(ROUTES.CREATE_LISTING)} : null}
                                />
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {listings.map((listing, index) => (
                                            <ListingCard
                                                key={listing.id}
                                                listing={listing}
                                                showActions={false}
                                                isOwner={currentUser?.id === listing.sellerId}
                                                currentUserId={currentUser?.id}
                                                priorityImage={index === 0}
                                            />
                                        ))}
                                    </div>
                                    {!listingsLoading && pagination.totalPages > 1 && (
                                        <div className="mt-6">
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

                    {/* ── Lists Tab ────────────────────────────── */}
                    {activeTab === 'lists' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Lists</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {isOwnProfile ? 'Your favorite lists' : 'Public favorite lists'}
                                    </p>
                                </div>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setShowCreateListModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-semibold transition-all duration-200 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New List
                                    </button>
                                )}
                            </div>

                            {listsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                                            <div className="aspect-[4/3] bg-gray-100" />
                                            <div className="p-4 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : favoriteLists.length === 0 ? (
                                <EmptyState
                                    icon={Heart}
                                    title="No lists yet"
                                    description={isOwnProfile ? "You haven't created any lists yet" : "This user hasn't shared any public lists yet"}
                                    action={isOwnProfile ? {label: 'Create List', onClick: () => setShowCreateListModal(true)} : null}
                                />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {favoriteLists.map(list => (
                                        <FavoriteListCard key={list.id} list={list} />
                                    ))}
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => setShowCreateListModal(true)}
                                            className="aspect-[4/3] bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                                                <Plus className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">New List</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Reviews Tab ──────────────────────────── */}
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
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
            `}</style>
        </div>
    );
};

/* ── Reusable Empty State ──────────────────────────────── */
const EmptyState = ({icon: Icon, iconColor = 'text-gray-400', iconBg = 'bg-gray-100', title, description, action}) => (
    <div className="rounded-2xl border border-gray-200 bg-white py-16 px-8 text-center">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
        {action && (
            <button
                onClick={action.onClick}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
                {action.label}
            </button>
        )}
    </div>
);

export default UserProfilePage;
