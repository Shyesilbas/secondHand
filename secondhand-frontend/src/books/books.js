
import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';
import { cleanAttributes } from '../listing/components/attributes/attributeValues.js';

const textOrNull = (value) => (value == null || String(value).trim() === '' ? null : String(value).trim());

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
    isbn: textOrNull(data.isbn),
    editionId: data.editionId || null,
    publisher: textOrNull(data.publisher),
    translator: textOrNull(data.translator),
    attributes: cleanAttributes(data.attributes),
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
    if (data.isbn !== undefined) updateData.isbn = textOrNull(data.isbn);
    // null unlinks the catalog edition.
    if (data.editionId !== undefined) updateData.editionId = data.editionId || null;
    if (data.publisher !== undefined) updateData.publisher = textOrNull(data.publisher);
    if (data.translator !== undefined) updateData.translator = textOrNull(data.translator);
    // Sent whole: the backend replaces the stored attributes, so a cleared answer is removed.
    if (data.attributes !== undefined) updateData.attributes = cleanAttributes(data.attributes);
    return updateData;
};

