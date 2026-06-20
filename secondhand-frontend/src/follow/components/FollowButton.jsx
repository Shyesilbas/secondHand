import {useTranslation} from "react-i18next";
import React, {memo, useEffect, useRef, useState} from 'react';
import {Bell, BellOff, ChevronDown, Loader2, UserCheck, UserPlus} from 'lucide-react';
import {useFollow} from '../hooks/useFollow.js';

const FollowButton = memo(({
  userId,
  size = 'md',
  showDropdown = true,
  className = ''
}) => {
  const {
    t
  } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    isFollowing,
    notifyOnNewListing,
    isToggling,
    isTogglingNotifications,
    toggleFollow,
    toggleNotifications,
    canFollow
  } = useFollow(userId);
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (!canFollow) return null;
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  const handleMainClick = () => {
    if (isFollowing && showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      toggleFollow();
    }
  };
  const handleUnfollow = () => {
    toggleFollow();
    setIsDropdownOpen(false);
  };
  const handleToggleNotifications = () => {
    toggleNotifications();
    setIsDropdownOpen(false);
  };
  return <div className={`relative ${className}`} ref={dropdownRef}>
            <button onClick={handleMainClick} disabled={isToggling} className={`
                    ${sizeClasses[size]}
                    inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200
                    ${isFollowing ? 'bg-background-secondary text-text-primary hover:bg-secondary-light border border-border-light' : 'bg-primary text-white hover:bg-primary-hover shadow-sm'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}>
                {isToggling ? <Loader2 className={`${iconSizes[size]} animate-spin`} /> : isFollowing ? <UserCheck className={iconSizes[size]} /> : <UserPlus className={iconSizes[size]} />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
                {isFollowing && showDropdown && <ChevronDown className={`${iconSizes[size]} ml-0.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isFollowing && showDropdown && isDropdownOpen && <div className="absolute right-0 mt-2 w-48 bg-background-primary rounded-lg shadow-lg border border-border-light py-1 z-[100]">
                    <button onClick={handleToggleNotifications} disabled={isTogglingNotifications} className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-secondary-light flex items-center gap-2.5 transition-colors">
                        {isTogglingNotifications ? <Loader2 className="w-4 h-4 animate-spin" /> : notifyOnNewListing ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-text-muted" />}
                        <span>{notifyOnNewListing ? 'Notifications On' : 'Notifications Off'}</span>
                    </button>
                    <div className="border-t border-border-light my-1" />
                    <button onClick={handleUnfollow} className="w-full px-4 py-2.5 text-left text-sm text-status-error hover:bg-status-error-bg flex items-center gap-2.5 transition-colors">
                        <UserPlus className="w-4 h-4 rotate-45" />
                        <span>{t("unfollow")}</span>
                    </button>
                </div>}
        </div>;
});
FollowButton.displayName = 'FollowButton';
export default FollowButton;