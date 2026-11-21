import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Bell,
  CreditCard,
  FileText,
  Inbox,
  ShieldCheck,
  ShoppingBag,
  Tag
} from 'lucide-react';
import { Badge } from '../../common/components/ui/index.js';
import { EMAIL_FILTERS } from '../emailConstants.js';

const EMAIL_FOLDER_ITEMS = [
  { id: EMAIL_FILTERS.ALL, label: 'Tüm E-Postalar', icon: Inbox },
  { id: EMAIL_FILTERS.ORDERS, label: 'Siparişler & Satışlar', icon: ShoppingBag },
  { id: EMAIL_FILTERS.PAYMENTS, label: 'Ödemeler & Makbuzlar', icon: CreditCard },
  { id: EMAIL_FILTERS.OFFERS, label: 'Pazarlık & Teklifler', icon: Tag },
  { id: EMAIL_FILTERS.ACCOUNT_SECURITY, label: 'Hesap & Güvenlik', icon: ShieldCheck },
  { id: EMAIL_FILTERS.SYSTEM_NOTIFICATIONS, label: 'Sistem & Bildirimler', icon: Bell },
  { id: EMAIL_FILTERS.LEGAL, label: 'Sözleşmeler', icon: FileText }
];

export const EmailFoldersSidebar = ({
  embedded,
  filterType,
  globalUnreadCount,
  onBack,
  onSelectFolder
}) => {
  const { t } = useTranslation();

  return (
    <aside className="hidden min-h-0 w-full min-w-0 flex-col border-r border-border bg-background-secondary lg:flex">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border-light bg-background-secondary px-3">
        <div className="flex min-w-0 items-center gap-2">
          {!embedded && (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 rounded p-1 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary"
              aria-label={t('back', 'Geri')}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
          <span className="truncate text-xs font-semibold tracking-tight text-text-primary">
            {t('mailbox', 'Posta Kutusu')}
          </span>
        </div>
        {globalUnreadCount > 0 && (
          <Badge variant="neutral" dot className="tabular-nums">
            {globalUnreadCount}
          </Badge>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label={t('mail_folders', 'E-posta klasörleri')}>
        {EMAIL_FOLDER_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = filterType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFolder(item.id)}
              className={`flex w-full items-center justify-between gap-2.5 rounded px-2.5 py-2 text-left text-sm transition-colors ${
                active
                  ? 'bg-background-tertiary font-semibold text-text-primary'
                  : 'font-medium text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-text-muted'}`}
                  strokeWidth={1.5}
                />
                <span className="truncate">{item.label}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export const EmailMobileFolderTabs = ({ filterType, onSelectFolder }) => (
  <div className="shrink-0 border-b border-border-light bg-background-secondary px-3 py-2 lg:hidden">
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
      {EMAIL_FOLDER_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectFolder(item.id)}
          className={`shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            filterType === item.id
              ? 'border border-border-focus bg-background-tertiary font-semibold text-text-primary'
              : 'border border-border bg-background-primary text-text-secondary'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
);
