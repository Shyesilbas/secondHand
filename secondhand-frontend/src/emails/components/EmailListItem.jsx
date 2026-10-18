import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { formatDateTime } from '../../common/formatters.js';
import { Trash2, ShoppingBag, CreditCard, Tag, ShieldCheck, Sparkles, Mail, FileText } from 'lucide-react';
import { EMAIL_TYPES } from '../emails.js';

const getCategoryIconAndStyle = (type) => {
  switch (type) {
    case EMAIL_TYPES.ORDER_CONFIRMATION:
    case EMAIL_TYPES.ORDER_CANCELLED:
    case EMAIL_TYPES.ORDER_COMPLETED:
    case EMAIL_TYPES.ORDER_REFUNDED:
    case EMAIL_TYPES.SALE_NOTIFICATION:
      return {
        icon: ShoppingBag,
        bg: 'bg-background-secondary text-text-primary border-border'
      };
    case EMAIL_TYPES.PAYMENT_VERIFICATION:
    case EMAIL_TYPES.PAYMENT_SUCCESS:
    case EMAIL_TYPES.PAYMENT_RECEIPT:
      return {
        icon: CreditCard,
        bg: 'bg-background-secondary text-status-success-text border-border'
      };
    case EMAIL_TYPES.OFFER_RECEIVED:
    case EMAIL_TYPES.OFFER_COUNTER_RECEIVED:
    case EMAIL_TYPES.OFFER_ACCEPTED:
    case EMAIL_TYPES.OFFER_REJECTED:
    case EMAIL_TYPES.OFFER_EXPIRED:
    case EMAIL_TYPES.OFFER_COMPLETED:
      return {
        icon: Tag,
        bg: 'bg-background-secondary text-text-primary border-border'
      };
    case EMAIL_TYPES.VERIFICATION:
    case EMAIL_TYPES.VERIFICATION_CODE:
    case EMAIL_TYPES.PASSWORD_RESET:
    case EMAIL_TYPES.PHONE_UPDATE:
    case EMAIL_TYPES.AUDIT_ALERT:
      return {
        icon: ShieldCheck,
        bg: 'bg-background-secondary text-status-warning-text border-border'
      };
    case EMAIL_TYPES.MEMBERSHIP_ACTIVATED:
    case EMAIL_TYPES.MEMBERSHIP_UPGRADE:
    case EMAIL_TYPES.GREAT_SELLER:
      return {
        icon: Sparkles,
        bg: 'bg-background-secondary text-text-primary border-border'
      };
    case EMAIL_TYPES.AGREEMENT_UPDATE:
    case EMAIL_TYPES.AGREEMENT_UPDATED:
      return {
        icon: FileText,
        bg: 'bg-background-tertiary text-text-secondary border-border'
      };
    default:
      return {
        icon: Mail,
        bg: 'bg-background-tertiary text-text-secondary border-border'
      };
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
  const [isHovered, setIsHovered] = useState(false);

  const formatShort = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      const now = new Date();
      const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      if (sameDay) {
        return d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return d.toLocaleDateString([], {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return formatDateTime(dateString);
    }
  };

  const rawContent = String(email?.content || '');
  const cleanContent = rawContent
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  const previewText = cleanContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const isUnread = !email.read && !email.isRead;

  const category = getCategoryIconAndStyle(email?.emailType);
  const Icon = category.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(email);
        }
      }}
      className={`group relative cursor-pointer border-b border-border-light transition-all duration-150 ${
        isSelected
          ? 'bg-background-secondary/70 border-l-2 border-l-primary'
          : isUnread
          ? 'bg-white hover:bg-background-secondary/80 border-l-2 border-l-transparent font-medium'
          : 'bg-background-secondary/30 hover:bg-background-secondary border-l-2 border-l-transparent opacity-90'
      }`}
      onClick={() => onSelect(email)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3.5 px-4 py-3.5">
        {/* Category Icon */}
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded border ${category.bg}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Okunmadı" />
              )}
              <h4 className={`truncate text-xs sm:text-sm tracking-tight ${isUnread ? 'font-semibold text-text-primary' : 'font-semibold text-text-secondary'}`}>
                {email.subject || '(Başlıksız)'}
              </h4>
            </div>

            <span className="shrink-0 text-xs font-semibold tabular-nums text-text-muted">
              {formatShort(email.sentAt)}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs font-medium text-text-tertiary">
            {email.senderEmail}
          </p>

          {previewText && (
            <p className="mt-1 line-clamp-1 text-xs text-text-tertiary font-normal leading-relaxed">
              {previewText}
            </p>
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(email.id, email.subject);
          }}
          disabled={isDeleting}
          className={`mt-0.5 shrink-0 rounded p-1.5 text-text-muted hover:text-status-error-text hover:bg-background-secondary transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title={t("delete", "Sil")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EmailListItem;