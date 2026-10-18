import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { Globe, Lock } from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { useCreateFavoriteList, useUpdateFavoriteList } from '../hooks/useFavoriteLists.js';
import logger from '../../common/utils/logger.js';
import { FAVORITE_LIST_MODAL_LIMITS } from '../favoriteListConstants.js';
const FIELD = "w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus";
const FavoriteListModal = ({
 isOpen,
 onClose,
 editList = null,
 onSuccess
}) => {
 const {
 t
 } = useTranslation();
 const [formData, setFormData] = useState({
 name: '',
 description: '',
 isPublic: false
 });
 const createMutation = useCreateFavoriteList();
 const updateMutation = useUpdateFavoriteList();
 useEffect(() => {
 if (editList) {
 setFormData({
 name: editList.name || '',
 description: editList.description || '',
 isPublic: editList.isPublic || false
 });
 } else {
 setFormData({
 name: '',
 description: '',
 isPublic: false
 });
 }
 }, [editList, isOpen]);
 const handleSubmit = async e => {
 e.preventDefault();
 try {
 if (editList) {
 await updateMutation.mutateAsync({
 listId: editList.id,
 data: formData
 });
 } else {
 await createMutation.mutateAsync(formData);
 }
 onSuccess?.();
 onClose();
 } catch (error) {
 // The mutation hook shows the error toast; keep the form open with the user's input.
 logger.error('Error saving list:', error);
 }
 };
 const isLoading = createMutation.isPending || updateMutation.isPending;
 const privacyClass = active => `flex h-10 items-center justify-center gap-2 rounded border text-sm transition-colors ${active ? 'border-primary text-text-primary ring-1 ring-primary' : 'border-border text-text-secondary hover:border-card-border-hover'}`;
 return <Modal isOpen={isOpen} onClose={onClose} title={editList ? 'Edit list' : 'Create new list'} size="sm" footer={<>
 <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
 <Button type="submit" form="favorite-list-form" disabled={isLoading || !formData.name.trim()}>
 {isLoading ? 'Saving...' : editList ? 'Save changes' : 'Create list'}
 </Button>
 </>}>
 <form id="favorite-list-form" onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="favorite-list-name" className="mb-1 block text-sm font-medium text-text-primary">{t("list_name")}</label>
 <input id="favorite-list-name" type="text" value={formData.name} onChange={e => setFormData({
 ...formData,
 name: e.target.value
 })} placeholder={t("e_g_home_decoration")} className={`h-10 ${FIELD}`} maxLength={FAVORITE_LIST_MODAL_LIMITS.NAME_MAX} required autoFocus />
 </div>

 <div>
 <label htmlFor="favorite-list-description" className="mb-1 block text-sm font-medium text-text-primary">{t("description_optional")}</label>
 <textarea id="favorite-list-description" value={formData.description} onChange={e => setFormData({
 ...formData,
 description: e.target.value
 })} placeholder={t("a_short_description_about_the_list")} className={`resize-none py-2 ${FIELD}`} rows={3} maxLength={FAVORITE_LIST_MODAL_LIMITS.DESCRIPTION_MAX} />
 </div>

 <fieldset>
 <legend className="mb-1 text-sm font-medium text-text-primary">{t("privacy")}</legend>
 <div className="grid grid-cols-2 gap-2">
 <button type="button" aria-pressed={!formData.isPublic} onClick={() => setFormData({
 ...formData,
 isPublic: false
 })} className={privacyClass(!formData.isPublic)}>
 <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("private")}
 </button>
 <button type="button" aria-pressed={formData.isPublic} onClick={() => setFormData({
 ...formData,
 isPublic: true
 })} className={privacyClass(formData.isPublic)}>
 <Globe className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("public")}
 </button>
 </div>
 <p className="mt-1 text-xs text-text-tertiary">
 {formData.isPublic ? 'Everyone can view and like this list' : 'Only you can view this list'}
 </p>
 </fieldset>
 </form>
 </Modal>;
};
export default FavoriteListModal;
