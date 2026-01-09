import React, { memo, useState } from 'react';
import { Users } from 'lucide-react';
import { useFollowStats } from '../hooks/useFollow.js';
import FollowListModal from './FollowListModal.jsx';

const formatCount = (count) => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
};

const FollowStats = memo(({ userId, showIcon = true, className = '' }) => {
    const { stats, isLoading } = useFollowStats(userId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('followers');

    const handleFollowersClick = () => {
        setModalTab('followers');
        setIsModalOpen(true);
    };

    const handleFollowingClick = () => {
        setModalTab('following');
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className={`flex items-center gap-3 text-sm text-text-secondary animate-pulse ${className}`}>
                <div className="h-4 w-20 bg-secondary-200 rounded" />
                <div className="h-4 w-20 bg-secondary-200 rounded" />
            </div>
        );
    }

    return (
        <>
            <div className={`flex items-center gap-4 text-sm ${className}`}>
                {showIcon && <Users className="w-4 h-4 text-text-muted" />}
                <button 
                    onClick={handleFollowersClick}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                    <span className="font-semibold text-text-primary">
                        {formatCount(stats.followersCount)}
                    </span>
                    <span className="text-text-secondary hover:text-indigo-600">followers</span>
                </button>
                <span className="text-text-muted">•</span>
                <button 
                    onClick={handleFollowingClick}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                    <span className="font-semibold text-text-primary">
                        {formatCount(stats.followingCount)}
                    </span>
                    <span className="text-text-secondary hover:text-indigo-600">following</span>
                </button>
            </div>

            <FollowListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId}
                initialTab={modalTab}
            />
        </>
    );
});

FollowStats.displayName = 'FollowStats';

export default FollowStats;

