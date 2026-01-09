import React, { useState, memo } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { followService } from '../services/followService.js';
import { ROUTES } from '../../common/constants/routes.js';

const FollowListModal = memo(({ isOpen, onClose, userId, initialTab = 'followers' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    const { data: followersData, isLoading: followersLoading } = useQuery({
        queryKey: ['followers-list', userId],
        queryFn: () => followService.getUserFollowers(userId, { page: 0, size: 50 }),
        enabled: isOpen && activeTab === 'followers',
    });

    const { data: followingData, isLoading: followingLoading } = useQuery({
        queryKey: ['following-list', userId],
        queryFn: () => followService.getUserFollowing(userId, { page: 0, size: 50 }),
        enabled: isOpen && activeTab === 'following',
    });

    if (!isOpen) return null;

    const followers = followersData?.content || [];
    const following = followingData?.content || [];
    const isLoading = activeTab === 'followers' ? followersLoading : followingLoading;
    const list = activeTab === 'followers' ? followers : following;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Connections</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'followers'
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Followers
                        {followersData && (
                            <span className="ml-1.5 text-xs text-gray-400">
                                ({followersData.totalElements || 0})
                            </span>
                        )}
                        {activeTab === 'followers' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'following'
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Following
                        {followingData && (
                            <span className="ml-1.5 text-xs text-gray-400">
                                ({followingData.totalElements || 0})
                            </span>
                        )}
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                        )}
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        </div>
                    ) : list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Users className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-sm">
                                {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone'}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {list.map((item) => {
                                const personId = activeTab === 'followers' ? item.followerId : item.followedId;
                                const personName = activeTab === 'followers' 
                                    ? `${item.followerName} ${item.followerSurname}`
                                    : `${item.followedName} ${item.followedSurname}`;
                                const initials = activeTab === 'followers'
                                    ? `${item.followerName?.[0] || ''}${item.followerSurname?.[0] || ''}`
                                    : `${item.followedName?.[0] || ''}${item.followedSurname?.[0] || ''}`;

                                return (
                                    <li key={item.id}>
                                        <Link
                                            to={ROUTES.USER_PROFILE(personId)}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                {initials.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {personName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
});

FollowListModal.displayName = 'FollowListModal';

export default FollowListModal;

