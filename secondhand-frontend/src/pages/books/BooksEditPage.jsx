import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useBooks } from '../../features/books/hooks/useBooks';
import BooksCreateForm from '../../features/books/components/BooksCreateForm';

const BooksEditPage = () => {
  const { id } = useParams();
  const notification = useNotification();
  const { book, isLoading, fetchBook, updateBook } = useBooks(id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchBook(id);
        setLoaded(true);
      } catch (e) {
        notification.showError('Error', 'Failed to load book listing');
      }
    };
    if (id) run();
  }, [id]);

  if (!loaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6">Loading...</div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Books Listing</h1>
          <p className="text-gray-600">Update your book listing details</p>
        </div>
        <BooksCreateForm
          initialData={book}
          isEdit={true}
          onUpdate={(data) => updateBook(id, data)}
        />
      </div>
    </div>
  );
};

export default BooksEditPage;


