export const BooksListingDTO = {
    id: '',
    listingNo: '',
    title: '',
    description: '',
    price: 0,
    currency: '',
    status: '',
    city: '',
    district: '',
    createdAt: '',
    updatedAt: '',
    sellerName: '',
    sellerSurname: '',
    sellerId: 0,
    type: '',
    author: '',
    bookType: null,
    genre: null,
    publicationYear: '',
    pageCount: 0,
    language: null,
    format: null,
    condition: null
};

export const createBooksCreateRequest = (data) => ({
  base: {
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    price: data.price,
    currency: data.currency || 'TRY',
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    imageUrl: data.imageUrl || undefined,
  },
  quantity: parseInt(data.quantity) || 1,
  author: (data.author || '').trim(),
  bookTypeId: data.bookTypeId,
  genreId: data.genreId,
  languageId: data.languageId,
  publicationYear: data.publicationYear,
  pageCount: data.pageCount,
  formatId: data.formatId,
  conditionId: data.conditionId,
  isbn: data.isbn || undefined,
});

export const createBooksUpdateRequest = (data) => {
  const updateData = {};
  const base = {};
  if (data.title !== undefined) base.title = data.title;
  if (data.description !== undefined) base.description = data.description;
  if (data.price !== undefined) base.price = data.price;
  if (data.currency !== undefined) base.currency = data.currency;
  if (data.city !== undefined) base.city = data.city;
  if (data.district !== undefined) base.district = data.district;
  if (data.imageUrl !== undefined) base.imageUrl = data.imageUrl;
  if (Object.keys(base).length > 0) updateData.base = base;

  updateData.quantity = data.quantity !== undefined && data.quantity !== '' ? parseInt(data.quantity) : undefined;
  updateData.author = data.author ?? undefined;
  updateData.bookTypeId = data.bookTypeId ?? undefined;
  updateData.genreId = data.genreId ?? undefined;
  updateData.languageId = data.languageId ?? undefined;
  updateData.publicationYear = data.publicationYear ?? undefined;
  updateData.pageCount = data.pageCount ?? undefined;
  updateData.formatId = data.formatId ?? undefined;
  updateData.conditionId = data.conditionId ?? undefined;
  updateData.isbn = data.isbn ?? undefined;
  return updateData;
};

export const createBooksListingDto = (data) => ({
  id: data.id,
  listingNo: data.listingNo,
  title: data.title,
  description: data.description,
  price: data.price,
  currency: data.currency,
  status: data.status,
  listingFeePaid: data.listingFeePaid,
  city: data.city,
  district: data.district,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  sellerName: data.sellerName,
  sellerSurname: data.sellerSurname,
  sellerId: data.sellerId,
  type: data.type,
  author: data.author,
  bookType: data.bookType,
  genre: data.genre,
  language: data.language,
  publicationYear: data.publicationYear,
  pageCount: data.pageCount,
  format: data.format,
  condition: data.condition,
  isbn: data.isbn,
  imageUrl: data.imageUrl,
});


export const createBooksFilterRequest = (data) => ({
  type: 'BOOKS',
  listingType: 'BOOKS',
  status: data.status || 'ACTIVE',
  city: data.city?.trim() || '',
  district: data.district?.trim() || '',
  minPrice: parseFloat(data.minPrice) || null,
  maxPrice: parseFloat(data.maxPrice) || null,
  currency: data.currency || 'TRY',
  bookTypeIds: Array.isArray(data.bookTypeIds) ? data.bookTypeIds : [],
  genreIds: Array.isArray(data.genreIds) ? data.genreIds : [],
  languageIds: Array.isArray(data.languageIds) ? data.languageIds : [],
  formatIds: Array.isArray(data.formatIds) ? data.formatIds : [],
  conditionIds: Array.isArray(data.conditionIds) ? data.conditionIds : [],
  minYear: parseInt(data.minYear) || null,
  maxYear: parseInt(data.maxYear) || null,
  minPageCount: parseInt(data.minPageCount) || null,
  maxPageCount: parseInt(data.maxPageCount) || null,
  sortBy: data.sortBy || 'createdAt',
  sortDirection: data.sortDirection || 'DESC',
  page: parseInt(data.page) || 0,
  size: parseInt(data.size) || 20,
});


