import {useTranslation} from "react-i18next";
import { memo, useState } from 'react';
import {Users} from 'lucide-react';
import {EmptyState, Modal, SkeletonList} from '../../common/components/ui/index.js';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {followService} from '../services/followService.js';
import {ROUTES} from '../../common/constants/routes.js';

const FollowListModal = memo(({
 isOpen,
 onClose,
 userId,
 initialTab = 'followers'
}) => {
 const {
 t
 } = useTranslation();
 const [activeTab, setActiveTab] = useState(initialTab);
 const {
 data: followersData,
 isLoading: followersLoading
 } = useQuery({
 queryKey: ['followers-list', userId],
 queryFn: () => followService.getUserFollowers(userId, {
 page: 0,
 size: 50
 }),
 enabled: isOpen && activeTab === 'followers'
 });
 const {
 data: followingData,
 isLoading: followingLoading
 } = useQuery({
 queryKey: ['following-list', userId],
 queryFn: () => followService.getUserFollowing(userId, {
 page: 0,
 size: 50
 }),
 enabled: isOpen && activeTab === 'following'
 });
 const followers = followersData?.content || [];
 const following = followingData?.content || [];
 const isLoading = activeTab === 'followers' ? followersLoading : followingLoading;
 const list = activeTab === 'followers' ? followers : following;
 const tabClass = active => `relative flex-1 py-3 text-sm transition-colors ${active ? 'font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary'}`;
 return <Modal isOpen={isOpen} onClose={onClose} title={t("connections")} size="sm">
 <div className="-mx-5 -mt-4 mb-2 flex border-b border-border-light" role="tablist">
 <button type="button" role="tab" aria-selected={activeTab === 'followers'} onClick={() => setActiveTab('followers')} className={tabClass(activeTab === 'followers')}>{t("followers")}{followersData && <span className="ml-1.5 tabular-nums text-text-tertiary">{followersData.totalElements || 0}</span>}
 {activeTab === 'followers' && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
 </button>
 <button type="button" role="tab" aria-selected={activeTab === 'following'} onClick={() => setActiveTab('following')} className={tabClass(activeTab === 'following')}>{t("following")}{followingData && <span className="ml-1.5 tabular-nums text-text-tertiary">{followingData.totalElements || 0}</span>}
 {activeTab === 'following' && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
 </button>
 </div>

 {isLoading ? <SkeletonList /> : list.length === 0 ? <EmptyState icon={Users} title={activeTab === 'followers' ? 'No followers yet' : 'Not following anyone'} /> : <ul className="-mx-5 divide-y divide-border-light">
 {list.map(item => {
 const isFollower = activeTab === 'followers';
 const personId = isFollower ? item.followerId : item.followedId;
 const first = isFollower ? item.followerName : item.followedName;
 const last = isFollower ? item.followerSurname : item.followedSurname;
 return <li key={item.id}>
 <Link to={ROUTES.USER_PROFILE(personId)} onClick={onClose} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-background-secondary">
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-sm font-medium text-text-secondary">
 {`${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()}
 </span>
 <span className="min-w-0 flex-1">
 <span className="block truncate text-sm font-medium text-text-primary">{first} {last}</span>
 <span className="block text-xs tabular-nums text-text-tertiary">{new Date(item.createdAt).toLocaleDateString()}</span>
 </span>
 </Link>
 </li>;
 })}
 </ul>}
 </Modal>;
});
FollowListModal.displayName = 'FollowListModal';
export default FollowListModal;
