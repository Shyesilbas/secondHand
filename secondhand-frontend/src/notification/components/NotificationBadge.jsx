import { useTranslation } from "react-i18next";
import { Bell } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
const NotificationBadge = ({
  onClick,
  className = ''
}) => {
  const {
    t
  } = useTranslation();
  const {
    unreadCount
  } = useInAppNotificationsContext();
  return <button onClick={onClick} className={`group relative p-2.5 text-slate-600 hover:text-text-primary transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50 ${className}`} title={t("notifications")}>
            <Bell className="w-[20px] h-[20px] stroke-[1.5px]" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-caption font-semibold text-white bg-status-error-bg rounded-full border-2 border-white shadow-sm shadow-red-500/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>}
        </button>;
};
export default NotificationBadge;