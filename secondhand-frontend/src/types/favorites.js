/**
 * Favorites Related DTOs
 */

// Base Favorite DTO
export const FavoriteDTO = {
  id: 0,
  userId: 0,
  listing: null,
  createdAt: '',
};

// Favorite Request DTO
export const FavoriteRequestDTO = {
  listingId: '',
};

// Favorite Stats DTO
export const FavoriteStatsDTO = {
  listingId: '',
  favoriteCount: 0,
  isFavorited: false,
};



// Favorite Filter/Pagination DTO
export const FavoriteFilterDTO = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
};

/**
 * Create Favorite Request DTO with validation
 * @param {string} listingId - The listing ID to add/remove from favorites
 * @returns {Object} - Validated DTO
 */
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
 * Create Favorite Filter DTO with validation
 * @param {Object} data - Filter data
 * @returns {Object} - Validated DTO
 */
export const createFavoriteFilter = (data = {}) => {
  return {
    page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
    sort: data.sort || 'createdAt,desc',
  };
};

/**
 * Create Bulk Stats Request DTO
 * @param {Array} listingIds - Array of listing IDs
 * @returns {Array} - Validated array of listing IDs
 */
export const createBulkStatsRequest = (listingIds) => {
  if (!Array.isArray(listingIds)) {
    throw new Error('Listing IDs must be an array');
  }
  
  return listingIds.filter(id => id != null).map(id => id.toString().trim());
};