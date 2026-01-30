import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ROUTES } from '../../common/constants/routes.js';
import { 
    ShoppingBag, 
    MessageSquare, 
    DollarSign, 
    Package, 
    Star,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingDown,
    UserPlus
} from 'lucide-react';

const NotificationItem = ({ notification, onMarkAsRead }) => {
    const navigate = useNavigate();

    const getNotificationIcon = (type) => {
        const iconMap = {
            OFFER_RECEIVED: ShoppingBag,
            OFFER_ACCEPTED: CheckCircle,
            OFFER_REJECTED: XCircle,
            OFFER_COUNTERED: DollarSign,
            OFFER_EXPIRED: AlertCircle,
            ORDER_CREATED: Package,
            ORDER_STATUS_CHANGED: Package,
            ORDER_CANCELLED: XCircle,
            ORDER_RECEIVED: Package,
            CHAT_MESSAGE_RECEIVED: MessageSquare,
            LISTING_PRICE_DROPPED: TrendingDown,
            LISTING_NEW_FROM_FOLLOWED: UserPlus,
            LISTING_SOLD: CheckCircle,
            REVIEW_RECEIVED: Star,
            PAYMENT_SUCCESS: CheckCircle,
            PAYMENT_FAILED: XCircle,
            AGREEMENT_UPDATED: AlertCircle,
            ACCOUNT_VERIFIED: CheckCircle,
            GENERIC_NOTIFICATION: AlertCircle,
        };
        return iconMap[type] || AlertCircle;
    };

    const getNotificationColor = (type) => {
        if (type.includes('SUCCESS') || type.includes('ACCEPTED') || type.includes('VERIFIED')) {
            return 'text-green-600 bg-green-50';
        }
        if (type.includes('REJECTED') || type.includes('FAILED') || type.includes('CANCELLED') || type.includes('EXPIRED')) {
            return 'text-red-600 bg-red-50';
        }
        if (type.includes('PRICE_DROPPED')) {
            return 'text-blue-600 bg-blue-50';
        }
        return 'text-slate-600 bg-slate-50';
    };

    const getNotificationRoute = (notification) => {
        const rawType = notification?.type;
        const type = rawType ? String(rawType).toUpperCase() : '';
        const rawMetadata = notification?.metadata;
        let metadataObj = {};
        if (rawMetadata && typeof rawMetadata === 'string') {
            try {
                metadataObj = JSON.parse(rawMetadata);
            } catch {
                metadataObj = {};
            }
        } else if (rawMetadata && typeof rawMetadata === 'object') {
            metadataObj = rawMetadata;
        }

        switch (type) {
            case 'OFFER_RECEIVED':
            case 'OFFER_ACCEPTED':
            case 'OFFER_REJECTED':
            case 'OFFER_COUNTERED':
            case 'OFFER_EXPIRED':
                return ROUTES.OFFERS;

            case 'ORDER_CREATED':
            case 'ORDER_STATUS_CHANGED':
            case 'ORDER_CANCELLED':
            case 'ORDER_RECEIVED':
                return ROUTES.MY_ORDERS;

            case 'CHAT_MESSAGE_RECEIVED':
                if (metadataObj.chatRoomId) {
                    return `${ROUTES.CHAT}?room=${metadataObj.chatRoomId}`;
                }
                return ROUTES.CHAT;

            case 'LISTING_PRICE_DROPPED':
            case 'LISTING_NEW_FROM_FOLLOWED':
                if (metadataObj.listingId) {
                    return ROUTES.LISTING_DETAIL(metadataObj.listingId);
                }
                return ROUTES.LISTINGS;

            case 'LISTING_SOLD':
                return ROUTES.I_SOLD;

            case 'REVIEW_RECEIVED':
                if (metadataObj.userId) {
                    return ROUTES.USER_REVIEWS(metadataObj.userId);
                }
                return ROUTES.DASHBOARD;

            case 'PAYMENT_SUCCESS':
            case 'PAYMENT_FAILED':
                return ROUTES.PAYMENTS;

            case 'ACCOUNT_VERIFIED':
                return ROUTES.DASHBOARD;

            case 'AGREEMENT_UPDATED':
                return ROUTES.AGREEMENTS_ALL;

            default:
                if (notification?.actionUrl === ROUTES.AGREEMENTS || notification?.actionUrl === '/agreements') {
                    return ROUTES.AGREEMENTS_ALL;
                }
                if (notification.actionUrl) {
                    return notification.actionUrl;
                }
                return ROUTES.DASHBOARD;
        }
    };

    const handleClick = () => {
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
        const route = getNotificationRoute(notification);
        navigate(route);
    };

    const Icon = getNotificationIcon(notification.type);
    const colorClasses = getNotificationColor(notification.type);

    return (
        <div
            onClick={handleClick}
            className={`px-4 py-3 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer ${
                !notification.isRead ? 'bg-blue-50/50' : ''
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${colorClasses}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                        </h4>
                        {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                        )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;

