import { useTranslation } from 'react-i18next';
import { useEffect, useId, useMemo, useState } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { FieldError } from '../../common/components/forms/FormPrimitives.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';
import { FORUM_AUTHOR_VISIBILITY, FORUM_CATEGORIES, FORUM_MESSAGES } from '../forumConstants.js';

const COMPOSABLE_CATEGORIES = [
  { id: FORUM_CATEGORIES.SUGGESTIONS, labelKey: 'forum_cat_suggestion_singular', fallback: 'Öneri' },
  { id: FORUM_CATEGORIES.COMPLAINTS, labelKey: 'forum_cat_complaint_singular', fallback: 'Şikayet' },
];

export const ThreadComposerModal = ({ isOpen, onClose, category, onSubmit }) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const titleInputId = useId();
  const descInputId = useId();

  const defaultCategory =
    category === FORUM_CATEGORIES.COMPLAINTS ? FORUM_CATEGORIES.COMPLAINTS : FORUM_CATEGORIES.SUGGESTIONS;
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  const canSubmit = useMemo(
    () => String(title || '').trim().length >= 5 && String(description || '').trim().length >= 10 && !submitting,
    [description, submitting, title]
  );

  const authorPreview = useMemo(() => {
    const authorVisibility = getForumVisibilitySettings().threadAuthorVisibility;
    if (authorVisibility === FORUM_AUTHOR_VISIBILITY.ANONYMOUS) {
      return t('anonymous', 'Anonim');
    }
    const name = String(user?.name || '').trim();
    const surname = String(user?.surname || '').trim();
    const initial = surname ? `${surname.slice(0, 1).toUpperCase()}.` : '';
    const display = `${name}${initial ? ` ${initial}` : ''}`.trim();
    return display || t('user', 'Kullanıcı');
  }, [t, user?.name, user?.surname]);

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
        category: selectedCategory,
        title: String(title || '').trim(),
        description: String(description || '').trim(),
      });
      if (res?.ok === false) {
        setError(res?.error || FORUM_MESSAGES.PUBLISH_THREAD_FAILED);
        setSubmitting(false);
        return;
      }
      reset();
      onClose?.();
    } catch (e) {
      setError(getErrorMessage(e, FORUM_MESSAGES.PUBLISH_THREAD_FAILED));
      setSubmitting(false);
    }
  };

  const titleLen = String(title || '').trim().length;
  const descLen = String(description || '').trim().length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('new_thread', 'Yeni konu')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            {t('close', 'Kapat')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? t('forum_publishing', 'Yayınlanıyor...') : t('forum_publish', 'Yayınla')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FieldError error={error} />

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-text-primary">
            {t('forum_category_label', 'Kategori')}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {COMPOSABLE_CATEGORIES.map((item) => {
              const active = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(item.id)}
                  disabled={submitting}
                  className={`h-10 rounded border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50 ${
                    active
                      ? 'border-accent-teal bg-accent-teal-50 text-accent-teal-800 ring-1 ring-accent-teal'
                      : 'border-border bg-background-primary text-text-secondary hover:border-card-border-hover hover:text-text-primary'
                  }`}
                >
                  {t(item.labelKey, item.fallback)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={titleInputId} className="text-sm font-medium text-text-primary">
              {t('title', 'Başlık')}
            </label>
            <span className={`text-xs tabular-nums ${titleLen >= 5 ? 'text-text-tertiary' : 'text-status-warning-text'}`}>
              {titleLen}/150
            </span>
          </div>
          <input
            id={titleInputId}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            className={`${inputNormal} h-10`}
            placeholder={t('write_a_clear_descriptive_title', 'Açık ve anlaşılır bir başlık yazın')}
            disabled={submitting}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={descInputId} className="text-sm font-medium text-text-primary">
              {t('description', 'Açıklama')}
            </label>
            <span className={`text-xs tabular-nums ${descLen >= 10 ? 'text-text-tertiary' : 'text-status-warning-text'}`}>
              {descLen}/5000
            </span>
          </div>
          <textarea
            id={descInputId}
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            className={`${inputNormal} resize-none`}
            placeholder={t('add_details_about_your_thread', 'Konunuz hakkında detayları ekleyin')}
            disabled={submitting}
          />
        </div>

        <p className="text-sm text-text-secondary">
          {t('posting_as', 'Şu isimle gönderiliyor:')}{' '}
          <span className="font-medium text-text-primary">{authorPreview}</span>
        </p>
      </div>
    </Modal>
  );
};
