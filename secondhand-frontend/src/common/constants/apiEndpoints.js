const getApiUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    if (import.meta.env.DEV) {
        return 'http://localhost:8080/api';
    }
    return `${window.location.origin}/api`;
};

const getWsUrl = () => {
    if (import.meta.env.VITE_WS_BASE_URL) {
        return import.meta.env.VITE_WS_BASE_URL;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
};

export const API_BASE_URL = getApiUrl();
export const WS_BASE_URL = getWsUrl();

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/v1/auth/login',
        REGISTER: '/v1/auth/register',
        LOGOUT: '/v1/auth/logout',
        REFRESH: '/v1/auth/refresh',
        OAUTH_COMPLETE: '/v1/auth/oauth2/complete',
        FORGOT_PASSWORD: '/v1/auth/passwords/forgot',
        RESET_PASSWORD: '/v1/auth/passwords/reset',
        CHANGE_PASSWORD: '/v1/auth/passwords/change',
        REVOKE_ALL_SESSIONS: '/v1/auth/revoke-all-sessions',
    },
    USER: {
        ME: '/v1/users/me',
        UPDATE_PHONE: '/v1/users/phone',
        VERIFY: '/v1/users/verification/verify',
        SEND_VERIFICATION: '/v1/users/verification/send',
        BY_ID: (id) => `/v1/users/${id}`,
        GREAT_SELLER_STATUS: (userId) => `/v1/users/${userId}/great-seller-status`,
        GREAT_SELLERS_LIST: (limit = 16) => `/v1/users/great-sellers?limit=${encodeURIComponent(limit)}`,
        SEARCH: '/v1/users/search',
        AUDIT_LOGS: '/v1/users/audit-logs',
        BADGES: '/v1/user/badges', // Aggregated endpoint for badge counts
    },
    LISTINGS: {
        MY_LISTINGS: '/v1/listings/my',
        BY_ID: (id) => `/v1/listings/${id}`,
        BY_LISTING_NO: (listingNo) => `/v1/listings/search/listing-no/${listingNo}`,
        SEARCH: '/v1/listings/search',
        DELETE: (id) => `/v1/listings/${id}`,
        MARK_SOLD: (id) => `/v1/listings/${id}/mark-sold`,
        UPDATE_QUANTITY: (id) => `/v1/listings/${id}/quantity`,
        UPDATE_PRICE: (id) => `/v1/listings/${id}/price`,
        UPDATE_QUANTITY_BATCH: '/v1/listings/quantity/batch',
        UPDATE_PRICE_BATCH: '/v1/listings/price/batch',
        RELIST: (id) => `/v1/listings/${id}/relist`,
        ACTIVATE: (id) => `/v1/listings/${id}/reactivate`,
        DEACTIVATE: (id) => `/v1/listings/${id}/deactivate`,
        STATISTICS: '/v1/listings/statistics',
        BY_USER: (userId) => `/v1/users/${userId}/listings`,
        FILTER: '/v1/listings/filter',
        TRACK_VIEW: (id) => `/v1/listings/${id}/view`,
        SOCIAL_PROOF: (id) => `/v1/listings/${id}/social-proof`,
        BY_STATUS: (status) => `/v1/listings/status/${status}`,
    },
    PAYMENTS: {
        LISTING_FEE_PAYMENT: '/v1/listings/pay-fee',
        MY_PAYMENTS: '/v1/payments/my',
        STATISTICS: '/v1/payments/statistics',
        INITIATE_VERIFICATION: '/v1/payments/initiate-verification',
    },
    ORDERS: {
        CHECKOUT: '/v1/orders/checkout',
        LIST_MY_ORDERS: '/v1/orders',
        LIST_SELLER_ORDERS: '/v1/orders/seller',
        STATUS_COUNTS: '/v1/orders/status-counts',
        SELLER_STATUS_COUNTS: '/v1/orders/seller/status-counts',
        GET_SELLER_ORDER_DETAILS: (id) => `/v1/orders/seller/${id}`,
        GET_PENDING_ESCROW_AMOUNT: '/v1/orders/seller/pending-escrow-amount',
        GET_BY_ORDER_NUMBER: (orderNumber) => `/v1/orders?orderNumber=${encodeURIComponent(orderNumber)}`,
        GET_ORDER_DETAILS: (id) => `/v1/orders/${id}`,
        CANCEL_ORDER: (id) => `/v1/orders/${id}/cancel`,
        REFUND_ORDER: (id) => `/v1/orders/${id}/refund`,
        COMPLETE_ORDER: (id) => `/v1/orders/${id}/complete`,
        UPDATE_ORDER_NAME: (id) => `/v1/orders/${id}/name`,
        UPDATE_ORDER_ADDRESS: (id) => `/v1/orders/${id}/address`,
        UPDATE_ORDER_NOTES: (id) => `/v1/orders/${id}/notes`,
        SHIP_ORDER: (id) => `/v1/orders/${id}/ship`,
        VERIFY_MEETUP: (orderNumber, code) => `/v1/orders/${orderNumber}/verify-meetup?code=${encodeURIComponent(code)}`,
        CONFIRM_HANDOVER: (orderNumber) => `/v1/orders/${orderNumber}/confirm-handover-completion`,
        GET_MEETUP_QR: (orderNumber) => `/v1/orders/${orderNumber}/qr-code`,
        REGENERATE_MEETUP_CODE: (orderNumber) => `/v1/orders/${orderNumber}/regenerate-meetup-code`,
    },
    CHECKOUT: {
        INITIATE: '/checkout/initiate',
    },
    DASHBOARD: {
        SELLER: '/v1/dashboards/seller', // GET - Seller dashboard
        BUYER: '/v1/dashboards/buyer', // GET - Buyer dashboard
    },
    COMPLAINTS: {
        CREATE: '/v1/complaints',
        MY_COMPLAINTS: '/v1/users/me/complaints',
    },
    EMAILS: {
        MY_EMAILS: '/v1/emails/my-emails',
        UNREAD_COUNT: '/v1/emails/unread-count',
        DELETE: (emailId) => `/v1/emails/${emailId}`,
        DELETE_ALL: '/v1/emails',
        MARK_READ: (emailId) => `/v1/emails/${emailId}/read`,
        MARK_ALL_READ: '/v1/emails/read-all',
    },
    ENUMS: {
        ALL: '/v1/enums/all',
    },
    VEHICLES: {
        CREATE: '/v1/vehicles/create-listing',
        BY_ID: (id) => `/v1/vehicles/${id}`,
        UPDATE: (id) => `/v1/vehicles/${id}`,
    },
    ELECTRONICS: {
        CREATE: '/v1/electronics/create-listing',
        BY_ID: (id) => `/v1/electronics/${id}`,
        UPDATE: (id) => `/v1/electronics/${id}`,
    },
    REAL_ESTATES: {
        CREATE: '/v1/real-estates/create-listing',
        BY_ID: (id) => `/v1/real-estates/${id}`,
        UPDATE: (id) => `/v1/real-estates/${id}`,
    },
    CLOTHING: {
        CREATE: '/v1/clothing/create-listing',
        BY_ID: (id) => `/v1/clothing/${id}`,
        UPDATE: (id) => `/v1/clothing/${id}`,
    },
    BOOKS: {
        CREATE: '/v1/books/create-listing',
        BY_ID: (id) => `/v1/books/${id}`,
        UPDATE: (id) => `/v1/books/${id}`,
    },
    SPORTS: {
        CREATE: '/v1/sports/create-listing',
        BY_ID: (id) => `/v1/sports/${id}`,
        UPDATE: (id) => `/v1/sports/${id}`,
    },
    FAVORITES: {
        TOGGLE: '/v1/favorites/toggle',
        MY_FAVORITES: '/v1/favorites',
        CHECK: (listingId) => `/v1/favorites/check/${listingId}`,
    },
    AGREEMENTS: {
        ALL: '/v1/agreements',
        REQUIRED: '/v1/agreements/required',
        ACCEPT: '/v1/agreements/accept',
        USER_AGREEMENTS: '/v1/agreements/user/agreements',
    },
    CHAT: {
        USER_ROOMS: '/v1/chats/rooms/user',
        DIRECT_ROOM: '/v1/chats/rooms/direct',
        CREATE_LISTING_ROOM: (listingId) => `/v1/chats/rooms/listing/${listingId}`,

        SEND_MESSAGE: '/v1/chats/messages',
        ROOM_MESSAGES: (chatRoomId) => `/v1/chats/rooms/${chatRoomId}/messages`,
        MARK_READ: (chatRoomId) => `/v1/chats/rooms/${chatRoomId}/messages/read`,

        DELETE_CONVERSATION: (chatRoomId) => `/v1/chats/rooms/${chatRoomId}`,
        DELETE_MESSAGE: (messageId) => `/v1/chats/messages/${messageId}`,
    },
    ADDRESS: {
        ALL: '/v1/users/addresses',
        CREATE: '/v1/users/addresses',
        UPDATE: (id) => `/v1/users/addresses/${id}`,
        DELETE: (id) => `/v1/users/addresses/${id}`,
        SELECT_MAIN: (id) => `/v1/users/addresses/${id}/main`,
    },
    PRICE_HISTORY: {
        BY_LISTING: (listingId) => `/v1/price-history/listing/${listingId}`,
    },
    CART: {
        GET_ITEMS: '/v1/cart',
        ADD_ITEM: '/v1/cart/items',
        UPDATE_ITEM: (listingId) => `/v1/cart/items/${listingId}`,
        REMOVE_ITEM: (listingId) => `/v1/cart/items/${listingId}`,
        CLEAR_CART: '/v1/cart/items',
        CHECK_ITEM: (listingId) => `/v1/cart/check/${listingId}`,
    },
    COUPONS: {
        PREVIEW: '/v1/coupons/preview',
        ACTIVE: '/v1/coupons/active',
        REDEMPTIONS: '/v1/coupons/redemptions',
    },
    ADMIN_COUPONS: {
        BASE: '/v1/admin/coupons',
        BY_ID: (id) => `/v1/admin/coupons/${id}`,
        AUDIENCE_STATS: (audience) => `/v1/admin/coupons/audience-stats?audience=${encodeURIComponent(audience)}`,
    },
    CAMPAIGNS: {
        SELLER: '/v1/seller/campaigns',
        BY_ID: (id) => `/v1/seller/campaigns/${id}`,
        PUBLIC: '/v1/campaigns/active',
    },
    OFFERS: {
        CREATE: '/v1/offers',
        MADE: '/v1/users/me/offers/made',
        RECEIVED: '/v1/users/me/offers/received',
        BY_ID: (id) => `/v1/offers/${id}`,
        ACCEPT: (id) => `/v1/offers/${id}/accept`,
        REJECT: (id) => `/v1/offers/${id}/reject`,
        COUNTER: (id) => `/v1/offers/${id}/counter`,
    },
    REVIEWS: {
        CREATE_REVIEW: '/v1/reviews',
        GET_REVIEWS_RECEIVED: '/v1/users/me/reviews/received',
        GET_REVIEWS_RECEIVED_BY: (userId) => `/v1/users/${userId}/reviews/received`,
        GET_REVIEWS_WRITTEN_BY: (userId) => `/v1/users/${userId}/reviews/written`,
        GET_USER_REVIEW_STATS: (userId) => `/v1/users/${userId}/review-stats`,
        GET_REVIEWS_BY_ORDER_ITEMS: '/v1/reviews',
    },
    EWALLET: {
        CREATE: '/v1/e-wallets',
        GET: '/v1/e-wallets',
        UPDATE_LIMITS: '/v1/e-wallets/limits',
        UPDATE_SPENDING_WARNING: '/v1/e-wallets/update/spending-warning',
        REMOVE_SPENDING_WARNING: '/v1/e-wallets/update/spending-warning',
        DEPOSIT: '/v1/e-wallets/deposit',
        WITHDRAW: '/v1/e-wallets/withdraw',
        TRANSACTIONS: '/v1/e-wallets/transactions',
        CHECK_BALANCE: '/v1/e-wallets/balance/check',
        SPENDING_WARNING_CHECK: '/v1/e-wallets/spending-warning/check',
    },
    SHOWCASES: {
        CREATE: '/v1/showcases',
        ACTIVE: '/v1/showcases/active',
        MY_SHOWCASES: '/v1/showcases/my',
        EXTEND: (id) => `/v1/showcases/${id}/extend`,
        CANCEL: (id) => `/v1/showcases/${id}/cancel`,
    },
    EXCHANGE: {
        RATE: (from, to) => `/v1/exchange-rates/${from}/${to}`,
    },
    IMAGES: {
        UPLOAD: '/v1/images/upload',
    },
    FOLLOW: {
        FOLLOW: (userId) => `/v1/follows/${userId}`,
        UNFOLLOW: (userId) => `/v1/follows/${userId}`,
        TOGGLE_NOTIFICATIONS: (userId) => `/v1/follows/${userId}/notifications`,
        STATS: (userId) => `/v1/follows/stats/${userId}`,
        USER_FOLLOWERS: (userId) => `/v1/follows/user/${userId}/followers`,
        USER_FOLLOWING: (userId) => `/v1/follows/user/${userId}/following`,
    },
    FAVORITE_LISTS: {
        CREATE: '/v1/favorite-lists',
        MY_LISTS: '/v1/favorite-lists/my',
        USER_LISTS: (userId) => `/v1/favorite-lists/user/${userId}`,
        BY_ID: (listId) => `/v1/favorite-lists/${listId}`,
        UPDATE: (listId) => `/v1/favorite-lists/${listId}`,
        DELETE: (listId) => `/v1/favorite-lists/${listId}`,
        ADD_ITEM: (listId) => `/v1/favorite-lists/${listId}/items`,
        REMOVE_ITEM: (listId, listingId) => `/v1/favorite-lists/${listId}/items/${listingId}`,
        LIKE: (listId) => `/v1/favorite-lists/${listId}/like`,
        UNLIKE: (listId) => `/v1/favorite-lists/${listId}/like`,
        LISTING_LISTS: (listingId) => `/v1/favorite-lists/listing/${listingId}/lists`,
    },
    NOTIFICATIONS: {
        ALL: '/v1/notifications',
        UNREAD_COUNT: '/v1/notifications/unread-count',
        MARK_AS_READ: (id) => `/v1/notifications/${id}/read`,
        MARK_ALL_AS_READ: '/v1/notifications/read-all',
    },
    FORUM: {
        THREADS: '/v1/forums/threads',
        THREAD_BY_ID: (threadId) => `/v1/forums/threads/${threadId}`,
        THREAD_STATUS: (threadId) => `/v1/forums/threads/${threadId}/status`,
        THREAD_REACTION: (threadId) => `/v1/forums/threads/${threadId}/reaction`,
        THREAD_COMMENTS: (threadId) => `/v1/forums/threads/${threadId}/comments`,
        COMMENT_REACTION: (threadId, commentId) => `/v1/forums/threads/${threadId}/comments/${commentId}/reaction`,
    },
    CATALOG: {
        LOCATIONS: {
            CITIES: '/v1/catalog/locations/cities',
            DISTRICTS: (cityKey) => `/v1/catalog/locations/districts?cityKey=${encodeURIComponent(cityKey)}`,
            NEIGHBORHOODS: (districtKey) => `/v1/catalog/locations/neighborhoods?districtKey=${encodeURIComponent(districtKey)}`,
        },
        VEHICLE: {
            ATTRIBUTES: (typeId) => `/v1/catalog/vehicle/attributes?typeId=${encodeURIComponent(typeId)}`,
        },
        ELECTRONICS: {
            ATTRIBUTES: (typeId) => `/v1/catalog/electronics/attributes?typeId=${encodeURIComponent(typeId)}`,
            MODEL: (modelId) => `/v1/catalog/electronics/models/${encodeURIComponent(modelId)}`,
        },
        REAL_ESTATE: {
            ATTRIBUTES: (typeId) => `/v1/catalog/real-estate/attributes?typeId=${encodeURIComponent(typeId)}`,
        },
        CLOTHING: {
            ATTRIBUTES: (typeId) => `/v1/catalog/clothing/attributes?typeId=${encodeURIComponent(typeId)}`,
        },
        BOOKS: {
            EDITIONS_BY_ISBN: (isbn) => `/v1/catalog/books/editions?isbn=${encodeURIComponent(isbn)}`,
            SEARCH: (q) => `/v1/catalog/books/search?q=${encodeURIComponent(q)}`,
            ATTRIBUTES: (typeId) => `/v1/catalog/books/attributes?typeId=${encodeURIComponent(typeId)}`,
        },
    },
    AI: {
        SUMMARY: (type, id) => `/v1/ai/summary/${type}/${id}`,
        CHATS: '/v1/ai/chats',
        NEW_CHAT: '/v1/ai/chats/new',
        CHAT_HISTORY: '/v1/ai/chats/history',
        AGENT_QUERY: '/v1/ai/agents/query',
        MEMORIES: '/v1/ai/memories',
    },
    MEMBERSHIP: {
        STATUS: '/v1/memberships/status',
        UPGRADE: '/v1/memberships/upgrade',
        CANCEL: '/v1/memberships/cancel',
        TOGGLE_AUTO_RENEW: '/v1/memberships/toggle-auto-renew',
    }
};
