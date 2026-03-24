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
  DELETE_LIST_TITLE: 'Listeyi Sil',
  DELETE_LIST_CONFIRM: 'Bu listeyi silmek istediğinize emin misiniz?',
  REMOVE_ITEM_TITLE: 'Ürünü Çıkar',
  REMOVE_ITEM_CONFIRM: 'Bu ürünü listeden çıkarmak istediğinize emin misiniz?',
  LINK_COPIED_TITLE: 'Başarılı',
  LINK_COPIED: 'Link kopyalandı!',
  NOT_FOUND_TITLE: 'Liste Bulunamadı',
  NOT_FOUND_BODY: 'Bu liste silinmiş veya size özel olabilir.',
  BACK: 'Geri Dön',
  SOLD_LABEL: 'Satıldı',
  INACTIVE_LABEL: 'Pasif',
});
