import { useTranslation } from "react-i18next";
import { memo, useState } from 'react';
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
  return count ? count.toString() : '0';
};

const FollowStats = memo(({
  userId,
  showIcon = true,
  className = ''
}) => {
  const { t } = useTranslation();
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
      <div className={`inline-flex items-center gap-2 text-xs text-text-muted animate-pulse ${className}`}>
        <div className="h-3.5 w-14 bg-background-secondary rounded" />
        <span>•</span>
        <div className="h-3.5 w-14 bg-background-secondary rounded" />
      </div>
    );
  }

  return (
    <>
      <div className={`inline-flex items-center gap-2 text-xs whitespace-nowrap shrink-0 ${className}`}>
        {showIcon && <Users className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} />}
        <button
          type="button"
          onClick={handleFollowersClick}
          className="inline-flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
        >
          <span className="font-semibold text-text-primary tabular-nums">
            {formatCount(stats?.followersCount)}
          </span>
          <span className="text-text-muted hover:text-text-primary">
            {t("followers", "takipçi")}
          </span>
        </button>
        <span className="text-border select-none" aria-hidden>•</span>
        <button
          type="button"
          onClick={handleFollowingClick}
          className="inline-flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
        >
          <span className="font-semibold text-text-primary tabular-nums">
            {formatCount(stats?.followingCount)}
          </span>
          <span className="text-text-muted hover:text-text-primary">
            {t("following", "takip")}
          </span>
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