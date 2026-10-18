import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';
import { FORUM_AUTHOR_VISIBILITY, FORUM_CATEGORIES, FORUM_MESSAGES } from '../forumConstants.js';
const CATEGORY_LABELS = {
 [FORUM_CATEGORIES.SUGGESTIONS]: 'Suggestion',
 [FORUM_CATEGORIES.COMPLAINTS]: 'Complaint'
};
export const ThreadComposerModal = ({
 isOpen,
 onClose,
 category,
 onSubmit
}) => {
 const {
 t
 } = useTranslation();
 const {
 user
 } = useAuthState();
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');
 const catLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS[FORUM_CATEGORIES.SUGGESTIONS];
 const canSubmit = useMemo(() => {
 return String(title || '').trim().length >= 3 && String(description || '').trim().length >= 3 && !submitting;
 }, [description, submitting, title]);
 const authorPreview = useMemo(() => {
 const authorVisibility = getForumVisibilitySettings().threadAuthorVisibility;
 const name = String(user?.name || '').trim();
 const surname = String(user?.surname || '').trim();
 if (authorVisibility === FORUM_AUTHOR_VISIBILITY.ANONYMOUS) return 'Anonymous';
 const initial = surname ? `${surname.slice(0, 1).toUpperCase()}.` : '';
 const display = `${name}${initial ? ` ${initial}` : ''}`.trim();
 return display || 'User';
 }, [user?.name, user?.surname]);
 const reset = () => {
 setTitle('');
 setDescription('');
 setError('');
 setSubmitting(false);
 };
 const handleClose = () => {
 if (submitting) return;
 reset();
 onClose?.();
 };
 const handleSubmit = async () => {
 if (!canSubmit) return;
 setSubmitting(true);
 setError('');
 try {
 const res = await onSubmit?.({
 category,
 title: String(title || '').trim(),
 description: String(description || '').trim()
 });
 if (res?.ok === false) {
 setError(res?.error || FORUM_MESSAGES.PUBLISH_THREAD_FAILED);
 setSubmitting(false);
 return;
 }
 reset();
 onClose?.();
 } catch (e) {
 setError(e?.message || FORUM_MESSAGES.PUBLISH_THREAD_FAILED);
 setSubmitting(false);
 }
 };
 const titleLen = String(title || '').trim().length;
 const descLen = String(description || '').trim().length;
 return <Modal isOpen={isOpen} onClose={handleClose} title={`${FORUM_MESSAGES.NEW_THREAD} · ${catLabel}`} size="lg" footer={<>
 <Button variant="secondary" onClick={handleClose} disabled={submitting}>{FORUM_MESSAGES.CLOSE}</Button>
 <Button onClick={handleSubmit} disabled={!canSubmit}>{submitting ? FORUM_MESSAGES.PUBLISHING : FORUM_MESSAGES.PUBLISH}</Button>
 </>}>
 <div className="space-y-4">
 {error && <p role="alert" className="text-sm text-status-error-text">{error}</p>}
 <div>
 <div className="mb-1 flex items-center justify-between">
 <label htmlFor="thread-title" className="text-sm font-medium text-text-primary">{t("title")}</label>
 <span className={`text-xs tabular-nums ${titleLen >= 3 ? 'text-text-tertiary' : 'text-status-warning-text'}`}>{titleLen}{t("3_min")}</span>
 </div>
 <input id="thread-title" value={title} onChange={e => setTitle(e.target.value)} className="h-10 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={t("write_a_clear_descriptive_title")} disabled={submitting} />
 </div>
 <div>
 <div className="mb-1 flex items-center justify-between">
 <label htmlFor="thread-description" className="text-sm font-medium text-text-primary">{t("description")}</label>
 <span className={`text-xs tabular-nums ${descLen >= 3 ? 'text-text-tertiary' : 'text-status-warning-text'}`}>{descLen}{t("3_min")}</span>
 </div>
 <textarea id="thread-description" rows={6} value={description} onChange={e => setDescription(e.target.value)} className="resize-none py-2 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={t("add_details_about_your_thread")} disabled={submitting} />
 </div>
 <p className="text-sm text-text-secondary">{t("posting_as")}<span className="font-medium text-text-primary">{authorPreview}</span></p>
 </div>
 </Modal>;
};
