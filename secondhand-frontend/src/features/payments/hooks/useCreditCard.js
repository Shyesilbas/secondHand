import { useState, useEffect } from 'react';
import { creditCardService } from '../services/creditCardService';
import { CreditCardDTO } from '../../../types/payments';

export const useCreditCard = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCreditCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await creditCardService.getAllCreditCards();
      setCreditCards(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (err) {
      setError(err.response?.data?.message || 'Kredi kartları yüklenirken bir hata oluştu');
      console.error('Error fetching credit cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCreditCard = async (creditCardData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creditCardService.createCreditCard(creditCardData);
      // Refresh the list after creating
      await fetchCreditCards();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Kredi kartı oluşturulurken bir hata oluştu');
      console.error('Error creating credit card:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCreditCard = async (id, creditCardData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creditCardService.updateCreditCard(id, creditCardData);
      // Refresh the list after updating
      await fetchCreditCards();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Kredi kartı güncellenirken bir hata oluştu');
      console.error('Error updating credit card:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCreditCard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creditCardService.deleteCreditCard();
      // Clear the credit cards list after deleting
      setCreditCards([]);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while deleting credit card');
      console.error('Error deleting credit card:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditCards();
  }, []);

  return {
    creditCards,
    isLoading,
    error,
    fetchCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    refetch: fetchCreditCards,
  };
};