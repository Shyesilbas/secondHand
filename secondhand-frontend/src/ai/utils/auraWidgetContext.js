import { ROUTES } from '../../common/constants/routes.js';

const LISTING_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_FILTER_ENTRIES = 12;
const MAX_FILTER_KEY_LEN = 64;
const MAX_FILTER_VAL_LEN = 120;

/** Widget konumu için route + sorgu parametrelerinden uiContext üretir. */
export function buildAuraWidgetUiContext() {
  const pathname = window.location.pathname || '/';
  const search = window.location.search || '';
  const params = new URLSearchParams(search);
  const filters = {};
  let n = 0;
  for (const [key, value] of params.entries()) {
    if (!key || value == null || value === '') continue;
    if (n >= MAX_FILTER_ENTRIES) break;
    filters[key.slice(0, MAX_FILTER_KEY_LEN)] = String(value).slice(0, MAX_FILTER_VAL_LEN);
    n++;
  }

  const listingId = extractListingIdFromPath(pathname);
  const currentPage = listingId
    ? 'listing_detail'
    : inferCurrentPageLabel(pathname);

  return {
    currentPage,
    route: pathname + search,
    listingId: listingId ?? undefined,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

function extractListingIdFromPath(pathname) {
  const m = pathname.match(/^\/listings\/([^/]+)/);
  if (!m) return null;
  const seg = decodeURIComponent(m[1]);
  if (seg === 'create' || seg === 'prefilter') return null;
  if (LISTING_UUID.test(seg)) return seg;
  return seg.length <= 100 ? seg : null;
}

function inferCurrentPageLabel(pathname) {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith(ROUTES.LISTINGS_PREFILTER)) return 'listings_prefilter';
  if (pathname.startsWith(ROUTES.CREATE_LISTING)) return 'create_listing';
  if (pathname.startsWith(ROUTES.SHOPPING_CART)) return 'cart';
  if (pathname.startsWith(ROUTES.CHECKOUT)) return 'checkout';
  if (pathname.startsWith(ROUTES.AURA_CHAT)) return 'aura_chat';
  if (pathname.startsWith(ROUTES.CHAT)) return 'chat';
  if (pathname.startsWith(ROUTES.MY_ORDERS)) return 'my_orders';
  if (pathname.startsWith(ROUTES.I_SOLD)) return 'i_sold';
  if (pathname.startsWith(ROUTES.FAVORITES)) return 'favorites';
  if (pathname.startsWith(ROUTES.OFFERS)) return 'offers';
  if (pathname.startsWith(ROUTES.FORUM)) return 'forum';
  if (pathname.startsWith(ROUTES.PAYMENTS)) return 'payments';
  if (pathname.startsWith(ROUTES.EWALLET)) return 'ewallet';
  if (pathname.startsWith(ROUTES.INBOX)) return 'inbox';
  if (pathname.startsWith(ROUTES.MY_LISTINGS)) return 'my_listings';
  if (pathname.startsWith(ROUTES.LISTINGS)) return 'listings';
  if (pathname.startsWith(ROUTES.PROFILE)) return 'profile';
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg || 'other';
}
