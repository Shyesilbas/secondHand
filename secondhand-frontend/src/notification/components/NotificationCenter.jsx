import React, { useState, useRef, useEffect } from 'react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import NotificationItem from './NotificationItem.jsx';
import { X, CheckCheck } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose }) => {
    const {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
    } = useInAppNotificationsContext();

    const centerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (centerRef.current && !centerRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={centerRef}
            className="absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 z-50 max-h-[600px] flex flex-col"
        >
            <div className="px-4 py-3 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs font-semibold bg-red-500 text-white px-2 py-1 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Mark all as read"
                        >
                            <CheckCheck className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                        No notifications yet
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;

