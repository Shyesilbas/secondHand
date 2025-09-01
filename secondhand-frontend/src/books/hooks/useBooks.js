import { useCallback, useState } from 'react';
import { booksService } from '../services/booksService.js';

export const useBooks = (id = null) => {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBook = useCallback(async (bookId) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await booksService.getBooksDetails(bookId);
      setBook(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Error fetching book listing');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBook = useCallback(async (bookId, payload) => {
    return booksService.updateBooksListing(bookId, payload);
  }, []);

  return {
    book,
    isLoading,
    error,
    fetchBook,
    updateBook,
  };
};


