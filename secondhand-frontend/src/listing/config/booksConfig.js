import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import BooksCreateForm from '../../books/components/BooksCreateForm.jsx';
import {booksService} from '../../books/services/booksService.js';
import {filterConfigs} from '../components/filters/filterConfigs.js';

export const booksConfig = {
  label: 'Books',
  icon: '📚',
  description: 'Books, magazines and printed materials',

  detailsComponent: GenericListingDetails,
  detailsSchema: {
    title: 'Books Information',
    fields: [
      { label: 'Author', key: 'author' },
      { label: 'Book Type', key: 'bookType', enumKey: 'bookTypes' },
      { label: 'Genre', key: 'genre', enumKey: 'bookGenres' },
      { label: 'Language', key: 'language', enumKey: 'bookLanguages' },
      { label: 'Publication Year', key: 'publicationYear' },
      { label: 'Page Count', key: 'pageCount' },
      { label: 'Format', key: 'format', enumKey: 'bookFormats' },
      { label: 'Condition', key: 'condition', enumKey: 'bookConditions' },
      { label: 'ISBN', key: 'isbn' },
    ],
  },
  createComponent: BooksCreateForm,
  formSchema: {
    initialData: {
      title: '', description: '', price: '', currency: 'TRY', quantity: 1,
      author: '', bookTypeId: '', genreId: '', _genreBookTypeId: '', languageId: '',
      publicationYear: '', pageCount: '', formatId: '', conditionId: '', isbn: '',
      city: '', district: '', imageUrl: '',
    },
    steps: [
      { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
      {
        id: 2, title: 'Book Specifications', description: 'Specify the details of your book', kind: 'details',
        sections: [
          {
            id: 'books-details', title: 'Book Details', description: 'Book information and features',
            fields: [
              { name: 'author', label: 'Author', type: 'text', required: true },
              {
                name: 'bookTypeId', label: 'Book Type', type: 'enum', enumKey: 'bookTypes', required: true,
                onChange: ({ value, ctx }) => { ctx.setValue('bookTypeId', value); ctx.setValue('genreId', ''); },
              },
              {
                name: 'genreId', label: 'Genre', type: 'enum', enumKey: 'bookGenres', required: true,
                disabledWhen: (ctx) => !ctx.formData?.bookTypeId,
                getOptions: (ctx) => (ctx.enums?.bookGenres || []).filter((g) => !ctx.formData?.bookTypeId || String(g?.bookTypeId ?? '') === String(ctx.formData?.bookTypeId)),
              },
              { name: 'languageId', label: 'Language', type: 'enum', enumKey: 'bookLanguages', required: true },
              { name: 'publicationYear', label: 'Publication Year', type: 'number', required: true },
              { name: 'pageCount', label: 'Page Count', type: 'number', required: true, min: 1 },
              { name: 'formatId', label: 'Format', type: 'enum', enumKey: 'bookFormats', required: true },
              { name: 'conditionId', label: 'Condition', type: 'enum', enumKey: 'bookConditions', required: true },
              { name: 'isbn', label: 'ISBN', type: 'text' },
            ],
          },
        ],
      },
      { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
    ],
    effects: [
      (ctx) => {
        const genreId = ctx.formData?.genreId;
        if (!genreId) { if (ctx.formData?._genreBookTypeId) ctx.setValue('_genreBookTypeId', ''); return; }
        const g = (ctx.enums?.bookGenres || []).find((x) => String(x?.id ?? x?.value ?? '') === String(genreId));
        const next = String(g?.bookTypeId ?? '');
        if (String(ctx.formData?._genreBookTypeId ?? '') !== String(next)) ctx.setValue('_genreBookTypeId', next);
        if (ctx.formData?.bookTypeId && next && String(next) !== String(ctx.formData?.bookTypeId)) ctx.setValue('genreId', '');
      },
    ],
    customValidators: [
      {
        when: ({ stepId }) => Number(stepId) === 2 || stepId === 'all',
        validate: ({ ctx }) => {
          const errors = {};
          if (ctx.formData?.bookTypeId && ctx.formData?.genreId && ctx.formData?._genreBookTypeId && String(ctx.formData._genreBookTypeId) !== String(ctx.formData.bookTypeId)) {
            errors.genreId = 'Genre does not belong to selected book type';
          }
          return errors;
        },
      },
    ],
    getTitle: ({ isEdit }) => (isEdit ? 'Edit Books Listing' : 'Create Books Listing'),
    getSubtitle: ({ isEdit }) => (isEdit ? 'Update your book listing details' : 'Create your book listing step by step'),
    normalizeInitialData: (data) => {
      if (!data) return null;
      return { ...data, bookTypeId: data?.bookTypeId || data?.bookType?.id || '', genreId: data?.genreId || data?.genre?.id || '', languageId: data?.languageId || data?.language?.id || '', formatId: data?.formatId || data?.format?.id || '', conditionId: data?.conditionId || data?.condition?.id || '' };
    },
  },
  service: {
    getById: (id) => booksService.getBooksDetails(id),
    update: (id, payload) => booksService.updateBooksListing(id, payload),
  },
  createFlow: {
    subtypeSelector: { enumKey: 'bookTypes', queryParamKey: 'bookTypeId', initialDataKey: 'bookTypeId', title: 'Choose book type', description: 'Select a type to tailor the form fields.', paramKey: 'bookTypeIds' },
    preFormSelectors: [
      {
        enumKey: 'bookGenres', initialDataKey: 'genreId', title: 'Choose genre', description: 'Select a genre to tailor the form fields.', kind: 'searchable', dependsOn: ['bookTypeId'], paramKey: 'genreIds',
        getOptions: ({ enums, selection }) => {
          const bookTypeId = selection?.bookTypeId;
          const all = enums?.bookGenres || [];
          return all.filter((g) => !bookTypeId || String(g?.bookTypeId ?? '') === String(bookTypeId)).map((g) => ({ id: String(g?.id ?? ''), label: String(g?.label ?? g?.name ?? '') })).filter((o) => o.id && o.label);
        },
      },
      { enumKey: 'bookLanguages', initialDataKey: 'languageId', title: 'Choose language', description: 'Select a language to tailor the form fields.', kind: 'grid', dependsOn: ['bookTypeId'], prefilter: false },
      { enumKey: 'bookFormats', initialDataKey: 'formatId', title: 'Choose format', description: 'Select a format to tailor the form fields.', kind: 'grid', dependsOn: ['bookTypeId'], prefilter: false },
      { enumKey: 'bookConditions', initialDataKey: 'conditionId', title: 'Choose condition', description: 'Select a condition to tailor the form fields.', kind: 'grid', dependsOn: ['bookTypeId'], prefilter: false },
    ],
  },
  filterConfig: filterConfigs.BOOKS,
  sortOptions: [
    { value: 'author', label: 'Author' }, { value: 'publicationYear', label: 'Year' },
    { value: 'pageCount', label: 'Page Count' }, { value: 'genre', label: 'Genre' },
    { value: 'price', label: 'Price' }, { value: 'createdAt', label: 'Date Added' },
  ],
  compactBadges: (listing) => [
    { label: listing.author, icon: '✍️', show: !!listing.author },
    { label: listing.bookType?.label || listing.bookType?.name || listing.bookType, icon: '📚', show: !!listing.bookType },
    { label: listing.genre?.label || listing.genre?.name || listing.genre, icon: '🏷️', show: !!listing.genre },
    { label: listing.publicationYear, icon: '📅', show: !!listing.publicationYear },
    { label: listing.pageCount ? `${listing.pageCount} pages` : null, icon: '📖', show: !!listing.pageCount },
  ].filter(badge => badge.show),
  defaultFilters: { minYear: 1450, maxYear: new Date().getFullYear() },
};

