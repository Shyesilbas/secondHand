import { useTranslation } from 'react-i18next';
import { Inbox, Bell, Mail, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInAppNotificationsContext } from '../../../../notification/InAppNotificationContext.jsx';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import { HEADER_COUNT_BADGE_CLASS, headerIconTriggerClass } from './HeaderIconButton.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { INBOX_TABS } from '../../../../inbox/inboxConstants.js';

const tabUrl = (tab) => `${ROUTES.INBOX}?tab=${tab}`;

const countBadge = (n) => {
  const v = Number(n) || 0;
  if (v <= 0) return null;
  return (
    <span className="min-w-5 rounded-sm bg-background-tertiary px-1.5 py-0.5 text-center text-xs font-medium tabular-nums text-text-secondary">
      {v > 99 ? '99+' : v}
    </span>
  );
};

const HeaderInboxMenu = ({
  isOpen,
  onToggle,
  onClose,
  emailCount,
  chatCount
}) => {
  const { t } = useTranslation();
  const { unreadCount } = useInAppNotificationsContext();
  const hubTotal = (Number(unreadCount) || 0) + (Number(emailCount) || 0) + (Number(chatCount) || 0);
  const rowClass =
    'flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        title={t('inbox', 'Gelen Kutusu')}
        aria-label={t('inbox_menu', 'Gelen kutusu menüsü')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={headerIconTriggerClass(isOpen)}
      >
        <Inbox className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        {hubTotal > 0 && (
          <span className={HEADER_COUNT_BADGE_CLASS}>
            {hubTotal > 99 ? '99+' : hubTotal}
          </span>
        )}
      </button>

      {isOpen && (
        <HeaderDropdownPanel className="w-64">
          <div className="border-b border-border-light px-3 pb-2 pt-1">
            <p className="text-xs font-medium text-text-tertiary">{t('inbox', 'Gelen Kutusu')}</p>
          </div>
          <nav className="mt-1 flex flex-col gap-0.5" aria-label={t('inbox', 'Gelen Kutusu')}>
            <Link to={tabUrl(INBOX_TABS.EMAILS)} onClick={onClose} className={rowClass}>
              <Mail className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1 font-medium text-text-primary">{t('mail', 'E-posta')}</span>
              {countBadge(emailCount)}
            </Link>
            <Link to={tabUrl(INBOX_TABS.NOTIFICATIONS)} onClick={onClose} className={rowClass}>
              <Bell className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1 font-medium text-text-primary">{t('notifications', 'Bildirimler')}</span>
              {countBadge(unreadCount)}
            </Link>
            <Link to={tabUrl(INBOX_TABS.CHAT)} onClick={onClose} className={rowClass}>
              <MessageSquare className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1 font-medium text-text-primary">{t('chat', 'Mesajlar')}</span>
              {countBadge(chatCount)}
            </Link>
            <hr className="my-1 border-0 border-t border-border-light" />
            <Link to={ROUTES.FORUM} onClick={onClose} className={rowClass}>
              <Users className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1 font-medium text-text-primary">{t('forum_community', 'Topluluk')}</span>
            </Link>
          </nav>
        </HeaderDropdownPanel>
      )}
    </div>
  );
};

export default HeaderInboxMenu;