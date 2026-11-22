import { useTranslation } from 'react-i18next';
import { formatDateTime, formatSmartEmailDate } from '../../common/formatters.js';
import { Trash2 } from 'lucide-react';
import { Button } from '../../common/components/ui/index.js';
import { EMAIL_TYPE_LABELS, extractEmailPreview, stripEmailEmojis } from '../emails.js';

const EmailListItem = ({
  email,
  isSelected,
  onSelect,
  onDelete,
  isDeleting
}) => {
  const { t } = useTranslation();

  const isUnread = !email.read && !email.isRead;
  const cleanSubject = stripEmailEmojis(email?.subject || '').trim() || t('untitled_email', '(Başlıksız e-posta)');
  const previewText = extractEmailPreview(email?.content, email?.subject);
  const categoryLabel = EMAIL_TYPE_LABELS[email?.emailType] || t('email', 'Bildirim');

  return (
    <li className="group relative">
      <button
        type="button"
        aria-current={isSelected ? 'true' : undefined}
        onClick={() => onSelect(email)}
        className={`block w-full border-l-2 px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
          isSelected
            ? 'border-l-accent-teal bg-accent-teal-50'
            : 'border-l-transparent bg-background-primary hover:bg-background-secondary'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5">
            {isUnread && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-accent-teal"
                aria-label={t('unread', 'Okunmadı')}
              />
            )}
            <span
              className={`truncate text-xs ${
                isSelected
                  ? 'font-medium text-accent-teal-800'
                  : isUnread
                    ? 'font-medium text-text-secondary'
                    : 'font-normal text-text-tertiary'
              }`}
            >
              {categoryLabel}
            </span>
          </span>

          <time
            dateTime={email.sentAt || undefined}
            className={`shrink-0 text-xs tabular-nums transition-opacity duration-150 md:group-hover:opacity-0 md:group-focus-within:opacity-0 ${
              isUnread ? 'font-medium text-text-primary' : 'font-normal text-text-tertiary'
            }`}
          >
            {formatSmartEmailDate(email.sentAt) || formatDateTime(email.sentAt)}
          </time>
        </div>

        <p
          className={`mt-1 line-clamp-1 text-sm leading-snug ${
            isUnread
              ? 'font-semibold text-text-primary'
              : isSelected
                ? 'font-medium text-text-primary'
                : 'font-normal text-text-primary'
          }`}
        >
          {cleanSubject}
        </p>

        {previewText && (
          <p className="mt-0.5 line-clamp-1 text-sm text-text-tertiary">
            {previewText}
          </p>
        )}
      </button>

      <div className="pointer-events-none absolute right-2.5 top-2.5 hidden opacity-0 transition-opacity duration-150 md:block group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <Button
          variant="danger"
          size="icon"
          onClick={() => onDelete(email.id, cleanSubject)}
          disabled={isDeleting}
          title={t('delete', 'Sil')}
          aria-label={`${t('delete_email', 'E-postayı sil')}: ${cleanSubject}`}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </Button>
      </div>
    </li>
  );
};

export default EmailListItem;
