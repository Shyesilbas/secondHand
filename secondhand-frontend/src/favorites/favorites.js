
export const FavoriteDTO = {
 id: 0,
 userId: 0,
 listing: null,
 createdAt: '',
};

export const FavoriteRequestDTO = {
 listingId: '',
};

export const FavoriteStatsDTO = {
 listingId: '',
 favoriteCount: 0,
 isFavorited: false,
};



export const FavoriteFilterDTO = {
 page: 0,
 size: 20,
 sort: 'createdAt,desc',
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

export const createFavoriteFilter = (data = {}) => {
 return {
 page: parseInt(data.page) || 0,
 size: parseInt(data.size) || 20,
 sort: data.sort || 'createdAt,desc',
 };
};

export const createBulkStatsRequest = (listingIds) => {
 if (!Array.isArray(listingIds)) {
 throw new Error('Listing IDs must be an array');
 }
 
 return listingIds.filter(id => id != null).map(id => id.toString().trim());
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