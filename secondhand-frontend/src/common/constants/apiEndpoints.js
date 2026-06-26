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
        UPDATE_EMAIL: '/v1/users/email',
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
        ALL: '/v1/listings/search',
        MY_LISTINGS: '/v1/listings/my',
        BY_ID: (id) => `/v1/listings/${id}`,
        BULK: '/v1/listings/bulks',
        BY_LISTING_NO: (listingNo) => `/v1/listings/search/listing-no/${listingNo}`,
        SEARCH: '/v1/listings/search',
        CREATE: '/v1/listings',
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
        VIEW_STATS: (id) => `/v1/listings/${id}/view-stats`,
        MY_LISTINGS_VIEW_STATS: '/v1/listings/my/view-stats',
    },
    PAYMENTS: {
        CREATE: '/v1/payments/pay',
        LISTING_FEE_PAYMENT: '/v1/listings/pay-fee',
        LISTING_FEE_CONFIG: '/v1/listings/fee-config',
        MY_PAYMENTS: '/v1/payments/my',
        STATISTICS: '/v1/payments/statistics',
        INITIATE_VERIFICATION: '/v1/payments/initiate-verification',
    },
    ORDERS: {
        CHECKOUT: '/v1/orders/checkout',
        LIST_MY_ORDERS: '/v1/orders',
        LIST_SELLER_ORDERS: '/v1/orders/seller',
        GET_SELLER_ORDER_DETAILS: (id) => `/v1/orders/seller/${id}`,
        GET_PENDING_ESCROW_AMOUNT: '/v1/orders/seller/pending-escrow-amount',
        PENDING_COMPLETION: '/v1/orders/pending-completion',
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
    DASHBOARD: {
        SELLER: '/v1/dashboards/seller',                                                  // GET - Seller dashboard
        BUYER: '/v1/dashboards/buyer',                                                    // GET - Buyer dashboard
    },
    COMPLAINTS: {
        CREATE: '/v1/complaints',
        MY_COMPLAINTS: '/v1/users/me/complaints',
        ABOUT_ME: '/v1/users/me/complaints/received',
    },
    EMAILS: {
        MY_EMAILS: '/v1/emails/my-emails',
        UNREAD_COUNT: '/v1/emails/unread-count',
        DELETE: (emailId) => `/v1/emails/${emailId}`,
        DELETE_ALL: '/v1/emails',
        MARK_READ: (emailId) => `/v1/emails/${emailId}/read`,
    },
    ENUMS: {
        ALL: '/v1/enums/all',
    },
    VEHICLES: {
        CREATE: '/v1/vehicles/create-listing',
        BY_ID: (id) => `/v1/vehicles/${id}`,
        UPDATE: (id) => `/v1/vehicles/${id}`,
        BY_BRAND_MODEL: (brandId, modelId) => `/v1/vehicles/brand/${brandId}/model/${modelId}`,
        BRANDS: '/v1/vehicles/brands',
        FILTER: '/v1/vehicles/filter',
    },
    ELECTRONICS: {
        CREATE: '/v1/electronics/create-listing',
        BY_ID: (id) => `/v1/electronics/${id}`,
        UPDATE: (id) => `/v1/electronics/${id}`,
        BY_TYPE: (electronicType) => `/v1/electronics/electronicType/${electronicType}`,
        FILTER: '/v1/electronics/filter',
    },
    REAL_ESTATES: {
        CREATE: '/v1/real-estates/create-listing',
        BY_ID: (id) => `/v1/real-estates/${id}`,
        UPDATE: (id) => `/v1/real-estates/${id}`,
        FILTER: '/v1/real-estates/filter',
    },
    CLOTHING: {
        CREATE: '/v1/clothing/create-listing',
        BY_ID: (id) => `/v1/clothing/${id}`,
        UPDATE: (id) => `/v1/clothing/${id}`,
        BY_BRAND_TYPE: (brand, clothingType) => `/v1/clothing/brand/${brand}/type/${clothingType}`,
        FILTER: '/v1/clothing/filter',
    },
    BOOKS: {
        CREATE: '/v1/books/create-listing',
        BY_ID: (id) => `/v1/books/${id}`,
        UPDATE: (id) => `/v1/books/${id}`,
        FILTER: '/v1/books/filter',
    },
    SPORTS: {
        CREATE: '/v1/sports/create-listing',
        BY_ID: (id) => `/v1/sports/${id}`,
        UPDATE: (id) => `/v1/sports/${id}`,
        FILTER: '/v1/sports/filter',
    },
    FAVORITES: {
        ADD: '/v1/favorites',
        TOGGLE: '/v1/favorites/toggle',
        MY_FAVORITES: '/v1/favorites',
        CHECK: (listingId) => `/v1/favorites/check/${listingId}`,
        TOP: '/v1/favorites/top',
        TOP_LISTINGS: '/v1/favorites/top-listings',
    },
    AGREEMENTS: {
        INITIALIZE: '/v1/agreements/initialize',
        ALL: '/v1/agreements',
        REQUIRED: '/v1/agreements/required',
        BY_TYPE: (agreementType) => `/v1/agreements/${agreementType}`,
        CREATE: '/v1/agreements',
        UPDATE_BY_ID: (agreementId) => `/v1/agreements/${agreementId}`,
        UPDATE_BY_TYPE: (agreementType) => `/v1/agreements/type/${agreementType}`,
        ACCEPT: '/v1/agreements/accept',
        USER_AGREEMENTS: '/v1/agreements/user/agreements',
        USER_STATUS_ALL: '/v1/agreements/user/status',
        USER_STATUS_BY_TYPE: (agreementType) => `/v1/agreements/user/status/${agreementType}`,
        USER_ACCEPTANCE_HISTORY: (agreementId) => `/v1/agreements/user/acceptance-history/${agreementId}`,
        ADMIN_ACCEPT_ALL: '/v1/agreements/admin/accept-all-users',
    },
    CHAT: {
        CREATE_ROOM: '/v1/chats/rooms',
        USER_ROOMS: '/v1/chats/rooms/user',
        DIRECT_ROOM: '/v1/chats/rooms/direct',
        CREATE_LISTING_ROOM: (listingId) => `/v1/chats/rooms/listing/${listingId}`,
        
        SEND_MESSAGE: '/v1/chats/messages',
        ROOM_MESSAGES: (chatRoomId) => `/v1/chats/rooms/${chatRoomId}/messages`,
        MARK_READ: (chatRoomId) => `/v1/chats/rooms/${chatRoomId}/messages/read`,
        
        ALL_USER_MESSAGES: '/v1/chats/messages/user',
        TOTAL_UNREAD_COUNT: `/v1/chats/messages/unread-count`,
        
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
        LATEST: (listingId) => `/v1/price-history/listing/${listingId}/latest`,
        EXISTS: (listingId) => `/v1/price-history/listing/${listingId}/exists`,
    },
    AUDIT_LOGS: {
        USER_BY_EMAIL: (userEmail) => `/v1/admin/audit-logs/user/${userEmail}`,
        USER_BY_ID: (userId) => `/v1/admin/audit-logs/user/id/${userId}`,
        BY_EVENT_TYPE: (eventType) => `/v1/admin/audit-logs/event-type/${eventType}`,
        BY_DATE_RANGE: '/v1/admin/audit-logs/date-range',
        FAILED_ATTEMPTS_BY_USER: (userEmail) => `/v1/admin/audit-logs/failed-attempts/user/${userEmail}`,
        FAILED_ATTEMPTS_BY_IP: (ipAddress) => `/v1/admin/audit-logs/failed-attempts/ip/${ipAddress}`,
    },
    AUDIT_ENUMS: {
        EVENT_TYPES: '/v1/audit/enums/event-types',
        EVENT_STATUSES: '/v1/audit/enums/event-statuses',
        ALL: '/v1/audit/enums/all',
    },
    CART: {
        GET_ITEMS: '/v1/cart',
        ADD_ITEM: '/v1/cart/items',
        UPDATE_ITEM: (listingId) => `/v1/cart/items/${listingId}`,
        REMOVE_ITEM: (listingId) => `/v1/cart/items/${listingId}`,
        CLEAR_CART: '/v1/cart/items',
        GET_COUNT: '/v1/cart/count',
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
        GET_REVIEW_BY_ORDER_ITEM: (orderItemId) => `/v1/orders/items/${orderItemId}/review`,
        GET_REVIEWS_FOR_LISTING: (listingId) => `/v1/listings/${listingId}/reviews`,
        GET_LISTING_REVIEW_STATS: (listingId) => `/v1/listings/${listingId}/review-stats`,
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
        BULK: '/v1/showcases/bulks',
        ACTIVE: '/v1/showcases/active',
        MY_SHOWCASES: '/v1/showcases/my',
        EXTEND: (id) => `/v1/showcases/${id}/extend`,
        CANCEL: (id) => `/v1/showcases/${id}/cancel`,
        PRICING_CONFIG: '/v1/showcases/pricing-config',
    },
    EXCHANGE: {
        RATE: (from, to) => `/v1/exchange-rates/${from}/${to}`,
    },
    IMAGES: {
        UPLOAD: '/v1/images/upload',
        DELETE: '/v1/images/delete',
    },
    FOLLOW: {
        FOLLOW: (userId) => `/v1/follows/${userId}`,
        UNFOLLOW: (userId) => `/v1/follows/${userId}`,
        TOGGLE_NOTIFICATIONS: (userId) => `/v1/follows/${userId}/notifications`,
        FOLLOWING: '/v1/follows/following',
        FOLLOWERS: '/v1/follows/followers',
        STATS: (userId) => `/v1/follows/stats/${userId}`,
        CHECK: (userId) => `/v1/follows/check/${userId}`,
        USER_FOLLOWERS: (userId) => `/v1/follows/user/${userId}/followers`,
        USER_FOLLOWING: (userId) => `/v1/follows/user/${userId}/following`,
    },
    FAVORITE_LISTS: {
        CREATE: '/v1/favorite-lists',
        MY_LISTS: '/v1/favorite-lists/my',
        USER_LISTS: (userId) => `/v1/favorite-lists/user/${userId}`,
        POPULAR: '/v1/favorite-lists/popular',
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
        COMMENT_BY_ID: (threadId, commentId) => `/v1/forums/threads/${threadId}/comments/${commentId}`,
        COMMENT_REACTION: (threadId, commentId) => `/v1/forums/threads/${threadId}/comments/${commentId}/reaction`,
    },
    CATALOG: {
        LOCATIONS: {
            CITIES: '/v1/catalog/locations/cities',
            DISTRICTS: (cityKey) => `/v1/catalog/locations/districts?cityKey=${encodeURIComponent(cityKey)}`,
            NEIGHBORHOODS: (districtKey) => `/v1/catalog/locations/neighborhoods?districtKey=${encodeURIComponent(districtKey)}`,
        }
    },
    AI: {
        SUMMARY: (type, id) => `/v1/ai/summary/${type}/${id}`
    },
    MEMBERSHIP: {
        STATUS: '/v1/memberships/status',
        UPGRADE: '/v1/memberships/upgrade',
        CANCEL: '/v1/memberships/cancel',
    }
};
