import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

const MIN_QUERY_LENGTH = 2;

/** Digits and X only, as typed in an ISBN field ("978-605-..." -> "978605..."). */
export const compactIsbn = (value) => String(value ?? '').replace(/[\s-]/g, '').toUpperCase();

const looksLikeIsbn = (value) => /^(\d{9}[\dX]|\d{13})$/.test(compactIsbn(value));

/**
 * React Query options for the book catalog lookup of the listing form: an ISBN-10/13 goes to the ISBN endpoint,
 * anything else searches titles and authors (`/catalog/books/search`). Both return a list of editions.
 */
export const bookEditionLookupQuery = (term) => {
	const q = String(term ?? '').trim();
	const isbn = looksLikeIsbn(q);
	return {
		queryKey: ['catalog', 'books', isbn ? 'isbn' : 'search', isbn ? compactIsbn(q) : q.toLocaleLowerCase('tr')],
		queryFn: () => get(isbn ? API_ENDPOINTS.CATALOG.BOOKS.EDITIONS_BY_ISBN(compactIsbn(q)) : API_ENDPOINTS.CATALOG.BOOKS.SEARCH(q)),
		enabled: q.length >= MIN_QUERY_LENGTH,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	};
};

/** Attribute definitions of a book type (usage marks; solved pages for test books). */
export const bookAttributeQuery = (typeId) => ({
	queryKey: ['catalog', 'books', 'attributes', String(typeId ?? '')],
	queryFn: () => get(API_ENDPOINTS.CATALOG.BOOKS.ATTRIBUTES(typeId)),
	enabled: Boolean(typeId),
	staleTime: 5 * 60 * 1000,
	gcTime: 30 * 60 * 1000,
});
