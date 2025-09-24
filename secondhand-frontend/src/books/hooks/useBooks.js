import { useEntity } from '../../common/hooks/useEntity.js';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { createBooksServiceAdapter } from '../../common/services/entityAdapters.js';
import { booksService } from '../services/booksService.js';
import { BooksListingDTO } from '../books.js';
import { useMemo } from 'react';

export const useBooks = (bookId = null) => {
  const booksServiceAdapter = useMemo(() => createBooksServiceAdapter(booksService), []);
  
  const result = useEntity({
    entityId: bookId,
    service: booksServiceAdapter,
    defaultData: BooksListingDTO,
    entityName: 'Books'
  });

    return {
    ...result,
    book: result.entity,
    fetchBook: result.fetchEntity,
    createBook: result.createEntity,
    updateBook: result.updateEntity,
    deleteBook: result.deleteEntity
  };
};


