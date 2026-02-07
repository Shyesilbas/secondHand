import { Bell } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';

const NotificationBadge = ({ onClick, className = '' }) => {
    const { unreadCount } = useInAppNotificationsContext();

    return (
        <button
            onClick={onClick}
            className={`group relative p-2.5 text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50 ${className}`}
            title="Notifications"
        >
            <Bell className="w-[20px] h-[20px] stroke-[1.5px]" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold text-white bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBadge;

