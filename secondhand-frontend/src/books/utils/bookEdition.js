// Fields the picked catalog edition fills; the form shows them read-only while an edition is linked and the
// backend (BooksEditionSnapshotter) copies the same facts again on save.
export const BOOK_CATALOG_FIELDS = [
	'author', 'bookTypeId', 'genreId', 'languageId', 'formatId', 'publicationYear', 'pageCount', 'isbn', 'publisher', 'translator',
];

export const hasBookEdition = (ctx) => Boolean(ctx?.formData?.editionId);

/** Links an edition and copies its facts; an empty title or photo takes the catalog title and cover. */
export const applyBookEdition = (ctx, edition, { previousTypeId } = {}) => {
	const set = ctx.setValue;
	set('editionId', edition.id);
	set('author', edition.authors ?? '');
	set('bookTypeId', edition.bookTypeId ?? '');
	set('genreId', edition.genreId ?? '');
	set('languageId', edition.languageId ?? '');
	set('formatId', edition.formatId ?? '');
	set('publicationYear', edition.publicationYear ?? '');
	set('pageCount', edition.pageCount ?? '');
	set('isbn', edition.isbn ?? '');
	set('publisher', edition.publisher ?? '');
	set('translator', edition.translator ?? '');
	// Attribute answers are defined per book type; another type's answers would be rejected.
	if (previousTypeId && String(previousTypeId) !== String(edition.bookTypeId)) set('attributes', {});
	if (!String(ctx.formData?.title ?? '').trim()) {
		set('title', [edition.title, edition.authors, edition.publisher].filter(Boolean).join(' - '));
	}
	if (!ctx.formData?.imageUrl && edition.coverUrl) set('imageUrl', edition.coverUrl);
};

/** Unlinks the edition; the copied facts stay and become editable. */
export const clearBookEdition = (ctx) => ctx.setValue('editionId', '');
