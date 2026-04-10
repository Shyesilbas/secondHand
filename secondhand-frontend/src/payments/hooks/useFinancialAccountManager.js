import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { normalizeArrayResponse, PAYMENT_QUERY_KEYS } from '../paymentSchema.js';
import { paymentService } from '../services/paymentService.js';

export const useCreditCard = () => {
  const { user, isAuthenticated } = useAuthState();
  const queryClient = useQueryClient();
  const notification = useNotification();

  const queryFn = useCallback(async () => {
    try {
      const data = await paymentService.getCreditCards();
      return normalizeArrayResponse(data);
    } catch (err) {
      if (err?.response?.status === 404) {
        return [];
      }
      throw err;
    }
  }, []);

  const {
    data: creditCards = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...PAYMENT_QUERY_KEYS.creditCards, user?.id],
    queryFn,
    enabled: !!(isAuthenticated && user?.id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const createCreditCardMutation = useMutation({
    mutationFn: ({ limit, cardData }) => paymentService.createCreditCard(limit, cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.creditCards, user?.id] });
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.paymentMethods, user?.id] });
      notification.showSuccess('Success', 'Credit card created successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to create credit card';
      notification.showError('Error', errorMessage);
    },
  });

  const deleteCreditCardMutation = useMutation({
    mutationFn: (cardId) => paymentService.deleteCreditCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.creditCards, user?.id] });
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.paymentMethods, user?.id] });
      notification.showSuccess('Success', 'Credit card deleted successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to delete credit card';
      notification.showError('Error', errorMessage);
    },
  });

  const createCreditCard = useCallback(async (limit, cardData = null) => {
    return createCreditCardMutation.mutateAsync({ limit, cardData });
  }, [createCreditCardMutation]);

  const deleteCreditCard = useCallback(async (cardId) => {
    return deleteCreditCardMutation.mutateAsync(cardId);
  }, [deleteCreditCardMutation]);

  return {
    creditCards,
    isLoading: isLoading || createCreditCardMutation.isPending,
    isDeleting: deleteCreditCardMutation.isPending,
    error: error?.response?.data?.message || error?.message || null,
    createCreditCard,
    deleteCreditCard,
    refetch,
  };
};

export const useBankAccountMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();

  const createMutation = useMutation({
    mutationFn: () => paymentService.createBankAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.bankAccounts, user?.id] });
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.paymentMethods, user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (accountId) => paymentService.deleteBankAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.bankAccounts, user?.id] });
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_QUERY_KEYS.paymentMethods, user?.id] });
    },
  });

  return {
    createBankAccount: createMutation.mutateAsync,
    deleteBankAccount: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const usePaymentMethods = () => {
  const { user, isAuthenticated } = useAuthState();

  const queryFn = useCallback(async () => {
    const [cardsResult, banksResult] = await Promise.allSettled([
      paymentService.getCreditCards(),
      paymentService.getBankAccounts(),
    ]);

    const cardsStatus = cardsResult.status === 'fulfilled' ? null : cardsResult.reason?.response?.status;
    const banksStatus = banksResult.status === 'fulfilled' ? null : banksResult.reason?.response?.status;

    if (cardsResult.status === 'rejected' && cardsStatus !== 404) {
      throw cardsResult.reason;
    }
    if (banksResult.status === 'rejected' && banksStatus !== 404) {
      throw banksResult.reason;
    }

    const cardsData = cardsResult.status === 'fulfilled' ? cardsResult.value : [];
    const banksData = banksResult.status === 'fulfilled' ? banksResult.value : [];

    return {
      creditCards: normalizeArrayResponse(cardsData),
      bankAccounts: normalizeArrayResponse(banksData),
    };
  }, []);

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [...PAYMENT_QUERY_KEYS.paymentMethods, user?.id],
    queryFn,
    enabled: !!(isAuthenticated && user?.id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    paymentMethods: {
      creditCards: data?.creditCards ?? [],
      bankAccounts: data?.bankAccounts ?? [],
    },
    isLoading,
    refetch,
  };
};

