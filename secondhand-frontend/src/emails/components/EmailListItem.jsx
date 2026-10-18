import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../common/formatters.js';
import { Trash2 } from 'lucide-react';
import { EMAIL_TYPE_LABELS, extractEmailPreview, stripEmailEmojis } from '../emails.js';

const formatShortDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return formatDateTime(dateString);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' })
    });
  } catch {
    return formatDateTime(dateString);
  }
};

const EmailListItem = ({
  email,
  isSelected,
  onSelect,
  onDelete,
  isDeleting
}) => {
  const { t } = useTranslation();

  const isUnread = !email.read && !email.isRead;
  const cleanSubject = stripEmailEmojis(email?.subject || '').trim() || t('untitled_email', '(Başlıksız E-Posta)');
  const previewText = extractEmailPreview(email?.content, email?.subject);
  const categoryLabel = EMAIL_TYPE_LABELS[email?.emailType] || t('email', 'Bildirim');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(email);
        }
      }}
      onClick={() => onSelect(email)}
      className={`group relative cursor-pointer border-b border-border-light border-l-2 px-4 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
        isSelected
          ? 'border-l-primary bg-background-secondary'
          : isUnread
          ? 'border-l-transparent bg-background-primary hover:bg-background-secondary/70'
          : 'border-l-transparent bg-background-primary hover:bg-background-secondary/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {isUnread && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-label={t('unread', 'Okunmadı')}
            />
          )}
          <span
            className={`truncate text-xs ${
              isUnread ? 'font-semibold text-text-primary' : 'font-medium text-text-tertiary'
            }`}
          >
            {categoryLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <time
            dateTime={email.sentAt || undefined}
            className={`text-xs tabular-nums ${
              isUnread ? 'font-semibold text-text-primary' : 'font-normal text-text-muted'
            }`}
          >
            {formatShortDate(email.sentAt)}
          </time>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(email.id, cleanSubject);
            }}
            disabled={isDeleting}
            className="rounded p-1 text-text-muted opacity-0 transition-opacity hover:bg-background-tertiary hover:text-status-error focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-30"
            title={t('delete', 'Sil')}
            aria-label={t('delete_email', 'E-postayı sil')}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <h3
        className={`mt-1 line-clamp-1 text-sm leading-snug ${
          isUnread
            ? 'font-semibold text-text-primary'
            : isSelected
            ? 'font-medium text-text-primary'
            : 'font-medium text-text-secondary'
        }`}
      >
        {cleanSubject}
      </h3>

      {previewText && (
        <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-text-tertiary">
          {previewText}
        </p>
      )}
    </div>
  );
};

export default EmailListItem;