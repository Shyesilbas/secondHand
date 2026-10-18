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
 return <span className="min-w-5 rounded-sm bg-secondary-200/90 px-2 py-0.5 text-center text-xs font-semibold tabular-nums text-text-secondary">
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
 const rowClass = 'flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-background-secondary/80 hover:text-text-primary';
 return <div className="relative">
 <button type="button" onClick={onToggle} title={t("inbox")} className="group relative rounded p-2.5 text-text-secondary transition-all duration-300 ease-in-out hover:bg-background-tertiary/50 hover:text-text-primary">
 <Inbox className="h-5 w-5 stroke-1.5" />
 {hubTotal > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-primary px-1 text-xs font-semibold leading-none text-white">
 {hubTotal > 99 ? '99+' : hubTotal}
 </span>}
 </button>

 {isOpen && <HeaderDropdownPanel className="!right-0 !w-64">
 <div className="border-b border-border-light px-3 pb-2 pt-1">
 <p className="text-xs font-semibold text-text-muted">{t("inbox")}</p>
 </div>
 <nav className="flex flex-col gap-0.5 p-1.5">
 <Link to={tabUrl(INBOX_TABS.EMAILS)} onClick={onClose} className={rowClass}>
 <Mail className="h-4 w-4 shrink-0 text-text-tertiary" />
 <span className="min-w-0 flex-1 font-medium">{t("mail")}</span>
 {countBadge(emailCount)}
 </Link>
 <Link to={tabUrl(INBOX_TABS.NOTIFICATIONS)} onClick={onClose} className={rowClass}>
 <Bell className="h-4 w-4 shrink-0 text-text-tertiary" />
 <span className="min-w-0 flex-1 font-medium">{t("notifications")}</span>
 {countBadge(unreadCount)}
 </Link>
 <Link to={tabUrl(INBOX_TABS.CHAT)} onClick={onClose} className={rowClass}>
 <MessageSquare className="h-4 w-4 shrink-0 text-text-tertiary" />
 <span className="min-w-0 flex-1 font-medium">{t("chat")}</span>
 {countBadge(chatCount)}
 </Link>
 </nav>
 </HeaderDropdownPanel>}
 </div>;
};
export default HeaderInboxMenu;