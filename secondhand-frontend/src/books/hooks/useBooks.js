import { useMemo } from 'react';
import { useListingEntityAlias } from '../../common/hooks/useListingEntityAlias.js';
import { createBooksServiceAdapter } from '../../common/services/entityAdapters.js';
import { booksService } from '../services/booksService.js';
import { BooksListingDTO } from '../books.js';

export const useBooks = (bookId = null) => {
  const adapter = useMemo(() => createBooksServiceAdapter(booksService), []);
  return useListingEntityAlias(adapter, {
    entityId: bookId,
    defaultData: BooksListingDTO,
    entityName: 'Books',
    keys: {
      entity: 'book',
      fetch: 'fetchBook',
      create: 'createBook',
      update: 'updateBook',
      delete: 'deleteBook',
    },
  });
};
