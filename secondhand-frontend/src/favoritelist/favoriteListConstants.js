export const FAVORITE_LIST_QUERY = Object.freeze({
  STALE_MY_MS: 30_000,
  STALE_USER_MS: 60_000,
  STALE_BY_ID_MS: 30_000,
  STALE_POPULAR_MS: 60_000,
  STALE_CONTAINING_MS: 30_000,
});

export const FAVORITE_LIST_PAGING = Object.freeze({
  PAGE: 0,
  MY_SIZE: 5,
  USER_SIZE: 5,
  POPULAR_SIZE: 10,
});

export const FAVORITE_LIST_LISTING_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
});

export const FAVORITE_LIST_MODAL_LIMITS = Object.freeze({
  NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
});

export const FAVORITE_LIST_MESSAGES = Object.freeze({
  DELETE_LIST_TITLE: 'Delete list',
  DELETE_LIST_CONFIRM: 'Are you sure you want to delete this list? This cannot be undone.',
  REMOVE_ITEM_TITLE: 'Remove listing',
  REMOVE_ITEM_CONFIRM: 'Remove this listing from the list?',
  LINK_COPIED_TITLE: 'Success',
  LINK_COPIED: 'Link copied to clipboard.',
  NOT_FOUND_TITLE: 'List not found',
  NOT_FOUND_BODY: 'This list may have been deleted or you may not have access.',
  BACK: 'Go back',
  SOLD_LABEL: 'Sold',
  INACTIVE_LABEL: 'Inactive',
});
