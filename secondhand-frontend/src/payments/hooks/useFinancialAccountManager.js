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
    const data = await paymentService.getCreditCards();
    return normalizeArrayResponse(data);
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
    mutationFn: (limit) => paymentService.createCreditCard(limit),
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
    mutationFn: () => paymentService.deleteCreditCard(),
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

  const createCreditCard = useCallback(async (limit) => {
    const res = await createCreditCardMutation.mutateAsync(limit);
    return res;
  }, [createCreditCardMutation]);

  const deleteCreditCard = useCallback(async () => {
    const res = await deleteCreditCardMutation.mutateAsync();
    return res;
  }, [deleteCreditCardMutation]);

  return {
    creditCards,
    isLoading: isLoading || createCreditCardMutation.isPending || deleteCreditCardMutation.isPending,
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
    mutationFn: () => paymentService.deleteBankAccount(),
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
    const [cardsData, banksData] = await Promise.all([
      paymentService.getCreditCards(),
      paymentService.getBankAccounts(),
    ]);
    return {
      creditCards: normalizeArrayResponse(cardsData),
      bankAccounts: Array.isArray(banksData) ? banksData : [],
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

