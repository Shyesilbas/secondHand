export const FAVORITE_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 20,
  STALE_TIME_MS: 5 * 60 * 1000,
  GC_TIME_MS: 30 * 60 * 1000,
});

export const FAVORITE_MESSAGES = Object.freeze({
  SUCCESS_TITLE: 'Success',
  ERROR_TITLE: 'Error',
  ADDED_TO_FAVORITES: 'Added to favorites',
  REMOVED_FROM_FAVORITES: 'Removed from favorites',
  TOGGLE_FAVORITE_FAILED: 'Failed to toggle favorite',
  BUTTON_ADDED: 'Added to Favorites!',
  BUTTON_REMOVED: 'Removed from Favorites!',
  UPDATE_FAVORITES_FAILED: 'Failed to update favorites',
});

export const FAVORITES_PAGE_TABS = Object.freeze({
  FAVORITES: 'favorites',
  LISTS: 'lists',
});
