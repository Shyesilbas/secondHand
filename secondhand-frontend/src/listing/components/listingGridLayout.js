// Two columns on phones; from sm up the column count follows the available width (see tailwind grid-cols-listing).
export const LISTING_GRID_COLUMNS = 'grid-cols-2 sm:grid-cols-listing';
export const LISTING_GRID_GAP = 'gap-3 sm:gap-4 lg:gap-5';
// Fixed-count preview rows (similar listings, cart favorites): exactly one full row per breakpoint
// (2x2 on phones, then 3, 4, 5 columns) at the same card width as the main grid.
export const LISTING_ROW_COLUMNS = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
export const LISTING_ROW_SIZE = 5;
export const listingRowItemClass = (index) => (index === 3 ? 'sm:hidden lg:block' : index === 4 ? 'hidden xl:block' : '');
