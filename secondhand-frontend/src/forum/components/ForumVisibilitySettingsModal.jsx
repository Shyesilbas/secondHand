import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { getForumVisibilitySettings, setForumCommentAuthorVisibility, setForumThreadAuthorVisibility } from '../utils/forumVisibilitySettings.js';
import { FORUM_AUTHOR_VISIBILITY, FORUM_MESSAGES } from '../forumConstants.js';
const normalize = value => value === FORUM_AUTHOR_VISIBILITY.DISPLAY_NAME ? FORUM_AUTHOR_VISIBILITY.DISPLAY_NAME : FORUM_AUTHOR_VISIBILITY.ANONYMOUS;
const ChoiceButton = ({
 active,
 disabled,
 onClick,
 children
}) => {
 return <button type="button" onClick={onClick} disabled={disabled} aria-pressed={active} className={`h-10 rounded border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-primary text-text-primary ring-1 ring-primary' : 'border-border text-text-secondary hover:border-card-border-hover hover:text-text-primary'}`}>
 {children}
 </button>;
};
export const ForumVisibilitySettingsModal = ({
 isOpen,
 onClose
}) => {
 const {
 t
 } = useTranslation();
 const initial = useMemo(() => getForumVisibilitySettings(), []);
 const [threadVisibility, setThreadVisibility] = useState(normalize(initial.threadAuthorVisibility));
 const [commentVisibility, setCommentVisibility] = useState(normalize(initial.commentAuthorVisibility));
 const handleClose = () => {
 onClose?.();
 };
 const setThread = v => {
 const next = normalize(v);
 setThreadVisibility(next);
 setForumThreadAuthorVisibility(next);
 };
 const setComment = v => {
 const next = normalize(v);
 setCommentVisibility(next);
 setForumCommentAuthorVisibility(next);
 };
 return <Modal isOpen={isOpen} onClose={handleClose} title={FORUM_MESSAGES.FORUM_SETTINGS} size="md" footer={<Button variant="secondary" onClick={handleClose}>{t("done")}</Button>}>
 <p className="text-sm text-text-secondary">{t("choose_how_your_name_appears_when_postin")}</p>
 <p className="mt-1 text-sm text-text-tertiary">{t("updates_do_not_affect_existing_threads_o")}</p>
 <div className="mt-5 space-y-5">
 <fieldset>
 <legend className="mb-2 text-sm font-medium text-text-primary">{t("new_thread_author")}</legend>
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
 <ChoiceButton active={threadVisibility === FORUM_AUTHOR_VISIBILITY.ANONYMOUS} onClick={() => setThread(FORUM_AUTHOR_VISIBILITY.ANONYMOUS)}>{t("anonymous")}</ChoiceButton>
 <ChoiceButton active={threadVisibility === FORUM_AUTHOR_VISIBILITY.DISPLAY_NAME} onClick={() => setThread(FORUM_AUTHOR_VISIBILITY.DISPLAY_NAME)}>{t("display_name")}</ChoiceButton>
 </div>
 </fieldset>
 <fieldset>
 <legend className="mb-2 text-sm font-medium text-text-primary">{t("comment_author")}</legend>
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
 <ChoiceButton active={commentVisibility === FORUM_AUTHOR_VISIBILITY.ANONYMOUS} onClick={() => setComment(FORUM_AUTHOR_VISIBILITY.ANONYMOUS)}>{t("anonymous")}</ChoiceButton>
 <ChoiceButton active={commentVisibility === FORUM_AUTHOR_VISIBILITY.DISPLAY_NAME} onClick={() => setComment(FORUM_AUTHOR_VISIBILITY.DISPLAY_NAME)}>{t("display_name")}</ChoiceButton>
 </div>
 </fieldset>
 </div>
 </Modal>;
};
