export const FAVORITE_DEFAULTS = Object.freeze({
 PAGE: 0,
 PAGE_SIZE: 20,
 STALE_TIME_MS: 5 * 60 * 1000,
 GC_TIME_MS: 30 * 60 * 1000,
});

export const FAVORITE_MESSAGES = Object.freeze({
 SUCCESS_TITLE: 'Başarılı',
 ERROR_TITLE: 'Hata',
 ADDED_TO_FAVORITES: 'Favorilere eklendi',
 REMOVED_FROM_FAVORITES: 'Favorilerden çıkarıldı',
 TOGGLE_FAVORITE_FAILED: 'Favori durumu güncellenemedi',
 BUTTON_ADDED: 'Favorilere eklendi',
 BUTTON_REMOVED: 'Favorilerden çıkarıldı',
 UPDATE_FAVORITES_FAILED: 'Favoriler güncellenemedi',
});

export const FAVORITES_PAGE_TABS = Object.freeze({
 FAVORITES: 'favorites',
 LISTS: 'lists',
});
