export const CHAT_DEFAULTS = Object.freeze({
  MESSAGE_PAGE: 0,
  MESSAGE_PAGE_SIZE: 20,
  ROOM_STALE_TIME_MS: 10 * 60 * 1000,
  ROOM_CACHE_TIME_MS: 30 * 60 * 1000,
  MESSAGE_STALE_TIME_MS: 5 * 60 * 1000,
  MESSAGE_CACHE_TIME_MS: 15 * 60 * 1000,
  MARK_READ_DELAY_MS: 1000,
  INITIAL_SCROLL_DELAY_MS: 100,
  NEW_MESSAGE_SCROLL_DELAY_MS: 50,
  MAX_LISTING_TITLE_PREVIEW: 10,
});

export const CHAT_ROOM_TYPES = Object.freeze({
  LISTING: 'LISTING',
  DIRECT: 'DIRECT',
});

export const CHAT_MESSAGE_TYPES = Object.freeze({
  TEXT: 'TEXT',
});

export const CHAT_MESSAGES = Object.freeze({
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  SUCCESS_TITLE: 'Success',
  ERROR_TITLE: 'Error',
  MESSAGE_DELETED: 'Message deleted successfully.',
  CONVERSATION_DELETED: 'Conversation deleted successfully.',
  DELETE_CONVERSATION_TITLE: 'Delete Conversation',
  DELETE_CONVERSATION_CONFIRMATION:
    'Are you sure you want to delete this conversation and all messages? This action cannot be undone.',
  NO_MESSAGES_YET: 'No Messages Yet',
  NO_MESSAGES_HELP: 'Start a conversation with a seller to see your messages here',
  BROWSE_LISTINGS: 'Browse Listings',
});
