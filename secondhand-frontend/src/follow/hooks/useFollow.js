import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followService } from '../services/followService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';

export const useFollowStats = (userId) => {
 const normalizedUserId = userId ? String(userId) : null;
 
 const {
 data: stats,
 isLoading,
 error,
 refetch
 } = useQuery({
 queryKey: ['followStats', normalizedUserId],
 queryFn: () => followService.getFollowStats(normalizedUserId),
 enabled: !!normalizedUserId,
 staleTime: 30 * 1000,
 gcTime: 5 * 60 * 1000,
 refetchOnMount: true,
 });

 return {
 stats: stats || { followersCount: 0, followingCount: 0, isFollowing: false, notifyOnNewListing: false },
 isLoading,
 error: error?.response?.data?.message || error?.message,
 refetch
 };
};

export const useFollow = (userId) => {
 const { user } = useAuthState();
 const notification = useNotification();
 const queryClient = useQueryClient();
 const normalizedUserId = userId ? String(userId) : null;

 const { stats, isLoading: statsLoading, refetch: refetchStats } = useFollowStats(normalizedUserId);

 const followMutation = useMutation({
 mutationFn: () => followService.follow(normalizedUserId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['followStats', normalizedUserId] });
 refetchStats();
 notification.showSuccess('Success', 'You are now following this user');
 },
 onError: (err) => {
 notification.showError('Error', err.response?.data?.message || 'Failed to follow user');
 }
 });

 const unfollowMutation = useMutation({
 mutationFn: () => followService.unfollow(normalizedUserId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['followStats', normalizedUserId] });
 refetchStats();
 notification.showSuccess('Success', 'You have unfollowed this user');
 },
 onError: (err) => {
 notification.showError('Error', err.response?.data?.message || 'Failed to unfollow user');
 }
 });

 const toggleNotificationsMutation = useMutation({
 mutationFn: () => followService.toggleNotifications(normalizedUserId),
 onSuccess: (response) => {
 queryClient.invalidateQueries({ queryKey: ['followStats', normalizedUserId] });
 refetchStats();
 notification.showSuccess(
 'Notifications Updated',
 response.notifyOnNewListing 
 ? 'You will receive notifications for new listings' 
 : 'Notifications turned off'
 );
 },
 onError: (err) => {
 notification.showError('Error', err.response?.data?.message || 'Failed to update notifications');
 }
 });

 const follow = useCallback(() => {
 return followMutation.mutateAsync();
 }, [followMutation]);

 const unfollow = useCallback(() => {
 return unfollowMutation.mutateAsync();
 }, [unfollowMutation]);

 const toggleFollow = useCallback(() => {
 if (stats.isFollowing) {
 return unfollow();
 } else {
 return follow();
 }
 }, [stats.isFollowing, follow, unfollow]);

 const toggleNotifications = useCallback(() => {
 return toggleNotificationsMutation.mutateAsync();
 }, [toggleNotificationsMutation]);

 const isOwnProfile = user && normalizedUserId && String(user.id) === normalizedUserId;

 return {
 isFollowing: stats.isFollowing,
 followersCount: stats.followersCount,
 followingCount: stats.followingCount,
 notifyOnNewListing: stats.notifyOnNewListing,
 isLoading: statsLoading || followMutation.isPending || unfollowMutation.isPending,
 isToggling: followMutation.isPending || unfollowMutation.isPending,
 isTogglingNotifications: toggleNotificationsMutation.isPending,
 follow,
 unfollow,
 toggleFollow,
 toggleNotifications,
 refetch: refetchStats,
 isOwnProfile,
 canFollow: !!user && !isOwnProfile,
 };
};

