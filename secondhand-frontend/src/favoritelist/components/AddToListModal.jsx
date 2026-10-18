import {useTranslation} from "react-i18next";
import {useEffect, useState} from 'react';
import {Check, Globe, List, Lock} from 'lucide-react';
import {Button, EmptyState, Modal, SkeletonList} from '../../common/components/ui/index.js';
import {
 useAddItemToList,
 useListsContainingListing,
 useMyFavoriteLists,
 useRemoveItemFromList
} from '../hooks/useFavoriteLists.js';
import FavoriteListModal from './FavoriteListModal.jsx';
import logger from '../../common/utils/logger.js';

const AddToListModal = ({
 isOpen,
 onClose,
 listingId,
 listingTitle
}) => {
 const {
 t
 } = useTranslation();
 const [showCreateModal, setShowCreateModal] = useState(false);
 const {
 data: myLists = [],
 isLoading: listsLoading,
 refetch
 } = useMyFavoriteLists();
 const {
 data: containingData,
 refetch: refetchContaining
 } = useListsContainingListing(listingId);
 const containingListIds = containingData?.listIds || [];
 const addMutation = useAddItemToList();
 const removeMutation = useRemoveItemFromList();
 useEffect(() => {
 if (isOpen) {
 refetch();
 refetchContaining();
 }
 }, [isOpen, refetch, refetchContaining]);
 const close = () => {
 setShowCreateModal(false);
 onClose();
 };
 const handleToggleList = async listId => {
 const isInList = containingListIds.includes(listId);
 try {
 if (isInList) {
 await removeMutation.mutateAsync({
 listId,
 listingId
 });
 } else {
 await addMutation.mutateAsync({
 listId,
 listingId
 });
 }
 } catch (error) {
 logger.error('Error toggling list:', error);
 }
 };
 const handleCreateListSuccess = () => {
 refetch();
 refetchContaining();
 setShowCreateModal(false);
 };
 // The create form replaces this dialog instead of stacking a second modal on top of it.
 if (isOpen && showCreateModal) {
 return <FavoriteListModal isOpen onClose={() => setShowCreateModal(false)} onSuccess={handleCreateListSuccess} />;
 }
 return <Modal isOpen={isOpen} onClose={close} title={t("add_to_list")} size="sm" footer={myLists.length > 0 ? <Button variant="secondary" onClick={() => setShowCreateModal(true)}>{t("create_new_list")}</Button> : null}>
 {listingTitle && <p className="mb-4 line-clamp-2 text-sm text-text-secondary">{listingTitle}</p>}
 {listsLoading ? <SkeletonList /> : myLists.length === 0 ? <EmptyState icon={List} title={t("no_lists_yet")} description={t("create_your_first_list_to_organize_saved")} primaryAction={{
 label: t("create_your_first_list"),
 onClick: () => setShowCreateModal(true)
 }} /> : <ul className="-mx-5 divide-y divide-border-light">
 {myLists.map(list => {
 const isInList = containingListIds.includes(list.id);
 const isProcessing = (addMutation.isPending || removeMutation.isPending) && (addMutation.variables?.listId === list.id || removeMutation.variables?.listId === list.id);
 return <li key={list.id}>
 <button type="button" onClick={() => handleToggleList(list.id)} disabled={isProcessing} aria-pressed={isInList} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-background-secondary disabled:cursor-wait disabled:opacity-50">
 <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${isInList ? 'border-primary bg-primary text-text-inverse' : 'border-border'}`}>
 {isInList && <Check className="h-4 w-4" strokeWidth={1.5} />}
 </span>
 <span className="min-w-0 flex-1">
 <span className="flex items-center gap-2">
 <span className="truncate text-sm font-medium text-text-primary">{list.name}</span>
 {list.isPublic ? <Globe className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-label="Public" /> : <Lock className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-label="Private" />}
 </span>
 <span className="block text-xs tabular-nums text-text-tertiary">
 {list.itemCount || 0} {(list.itemCount || 0) === 1 ? 'item' : 'items'}
 </span>
 </span>
 </button>
 </li>;
 })}
 </ul>}
 </Modal>;
};
export default AddToListModal;
