export const UNREAD_COUNT_KEYS = {
 all: ['unreadCount'],
 total: (userId) => [...UNREAD_COUNT_KEYS.all, 'total', userId],
 room: (roomId, userId) => [...UNREAD_COUNT_KEYS.all, 'room', roomId, userId],
};

