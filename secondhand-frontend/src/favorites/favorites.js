

export const FavoriteRequestDTO = {
 listingId: '',
};

export const FavoriteStatsDTO = {
 listingId: '',
 favoriteCount: 0,
 isFavorited: false,
};

export const createFavoriteRequest = (listingId) => {
 if (!listingId) {
 throw new Error('Listing ID is required');
 }
 
 return {
 ...FavoriteRequestDTO,
 listingId: listingId.toString().trim(),
 };
};

/**
 * Standard accessor for a listing's total favorite count.
 * Checks favoriteStats.favoriteCount -> socialProof.favoriteCount -> favoriteCount -> 0.
 */
export const getListingFavoriteCount = (listing) => {
  if (!listing) return 0;
  if (typeof listing.favoriteStats?.favoriteCount === 'number') {
    return listing.favoriteStats.favoriteCount;
  }
  if (typeof listing.socialProof?.favoriteCount === 'number') {
    return listing.socialProof.favoriteCount;
  }
  if (typeof listing.favoriteCount === 'number') {
    return listing.favoriteCount;
  }
  return 0;
};