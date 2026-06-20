import { useTranslation } from "react-i18next";
import { Inbox, Bell, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInAppNotificationsContext } from '../../../../notification/InAppNotificationContext.jsx';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { INBOX_TABS } from '../../../../inbox/inboxConstants.js';
const tabUrl = tab => `${ROUTES.INBOX}?tab=${tab}`;
const countBadge = n => {
  const v = Number(n) || 0;
  if (v <= 0) return null;
  return <span className="min-w-[1.25rem] rounded-full bg-slate-200/90 px-2 py-0.5 text-center text-caption font-bold tabular-nums text-slate-700">
            {v > 99 ? '99+' : v}
        </span>;
};
const HeaderInboxMenu = ({
  isOpen,
  onToggle,
  onClose,
  emailCount,
  chatCount
}) => {
  const {
    t
  } = useTranslation();
  const {
    unreadCount
  } = useInAppNotificationsContext();
  const hubTotal = (Number(unreadCount) || 0) + (Number(emailCount) || 0) + (Number(chatCount) || 0);
  const rowClass = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50/80 hover:text-text-primary';
  return <div className="relative">
            <button type="button" onClick={onToggle} title={t("inbox")} className="group relative rounded-xl p-2.5 text-slate-600 transition-all duration-300 ease-in-out hover:bg-slate-100/50 hover:text-text-primary">
                <Inbox className="h-5 w-5 stroke-[1.5px]" />
                {hubTotal > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gray-900 px-1 text-caption font-bold leading-none text-white">
                        {hubTotal > 99 ? '99+' : hubTotal}
                    </span>}
            </button>

            {isOpen && <HeaderDropdownPanel className="!right-0 !w-64">
                    <div className="border-b border-slate-100 px-3 pb-2 pt-1">
                        <p className="text-caption font-semibold uppercase tracking-wider text-slate-400">{t("inbox")}</p>
                    </div>
                    <nav className="flex flex-col gap-0.5 p-1.5">
                        <Link to={tabUrl(INBOX_TABS.EMAILS)} onClick={onClose} className={rowClass}>
                            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                            <span className="min-w-0 flex-1 font-medium">{t("mail")}</span>
                            {countBadge(emailCount)}
                        </Link>
                        <Link to={tabUrl(INBOX_TABS.NOTIFICATIONS)} onClick={onClose} className={rowClass}>
                            <Bell className="h-4 w-4 shrink-0 text-slate-500" />
                            <span className="min-w-0 flex-1 font-medium">{t("notifications")}</span>
                            {countBadge(unreadCount)}
                        </Link>
                        <Link to={tabUrl(INBOX_TABS.CHAT)} onClick={onClose} className={rowClass}>
                            <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                            <span className="min-w-0 flex-1 font-medium">{t("chat")}</span>
                            {countBadge(chatCount)}
                        </Link>
                    </nav>
                </HeaderDropdownPanel>}
        </div>;
};
export default HeaderInboxMenu;