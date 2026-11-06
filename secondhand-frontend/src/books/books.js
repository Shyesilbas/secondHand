
import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';

export const createBooksCreateRequest = (data) => ({
    base: createListingBaseCreatePayload(data),
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
    const base = createListingBaseUpdatePayload(data);
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

