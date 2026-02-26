import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ewalletService } from '../services/ewalletService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const EWALLET_KEYS = {
    wallet: ['ewallet'],
    transactions: (page, size) => ['ewallet', 'transactions', page, size],
};

export const useEWallet = (options = {}) => {
    const { showNotification } = useNotification();
    const queryClient = useQueryClient();
    const enabled = options.enabled ?? true;

    // ---- Query: Fetch wallet ----
    const {
        data: eWallet = null,
        isLoading: walletLoading,
        error: walletError,
        refetch: refreshWallet,
    } = useQuery({
        queryKey: EWALLET_KEYS.wallet,
        queryFn: ewalletService.getEWallet,
        enabled,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 2;
        },
    });

    const invalidateWallet = () => queryClient.invalidateQueries({ queryKey: EWALLET_KEYS.wallet });

    // ---- Helper: wrap mutation ----
    const useMutationWithNotification = (mutationFn, successMsg, errorMsg) =>
        useMutation({
            mutationFn,
            onSuccess: () => {
                invalidateWallet();
                if (successMsg) showNotification(successMsg, 'success');
            },
            onError: (err) => {
                const msg = err.response?.data?.message || err.message || errorMsg;
                showNotification(msg, 'error');
            },
        });

    const createMutation = useMutationWithNotification(
        (opts = {}) => ewalletService.createEWallet({ limit: opts.limit ?? 1000, spendingWarningLimit: opts.spendingWarningLimit ?? 200 }),
        'eWallet created successfully',
        'Failed to create eWallet'
    );

    const updateLimitsMutation = useMutationWithNotification(
        (newLimit) => ewalletService.updateLimits(newLimit),
        'Limit updated successfully',
        'Failed to update limit'
    );

    const updateSpendingWarningMutation = useMutationWithNotification(
        (newLimit) => ewalletService.updateSpendingWarningLimit(newLimit),
        'Spending warning limit updated',
        'Failed to update spending warning limit'
    );

    const removeSpendingWarningMutation = useMutationWithNotification(
        () => ewalletService.removeSpendingWarningLimit(),
        'Spending warning limit removed',
        'Failed to remove spending warning limit'
    );

    const depositMutation = useMutationWithNotification(
        ({ amount, bankId }) => ewalletService.deposit(amount, bankId),
        'Deposit successful',
        'Failed to deposit'
    );

    const withdrawMutation = useMutationWithNotification(
        ({ amount, bankId }) => ewalletService.withdraw(amount, bankId),
        'Withdrawal successful',
        'Failed to withdraw'
    );

    // ---- Transactions (on-demand) ----
    const fetchTransactions = async (page = 0, size = 10) => {
        const data = await ewalletService.getTransactions(page, size);
        return data.content || data;
    };

    // ---- Balance check (non-mutating) ----
    const checkBalance = async (amount) => {
        try {
            return await ewalletService.checkBalance(amount);
        } catch {
            return false;
        }
    };

    const isPending = createMutation.isPending || updateLimitsMutation.isPending ||
        updateSpendingWarningMutation.isPending || removeSpendingWarningMutation.isPending ||
        depositMutation.isPending || withdrawMutation.isPending;

    return {
        eWallet,
        transactions: [], // Maintained for backward compat - use fetchTransactions
        loading: walletLoading || isPending,
        error: walletError?.message || null,
        createEWallet: (opts) => createMutation.mutateAsync(opts),
        updateLimits: (newLimit) => updateLimitsMutation.mutateAsync(newLimit),
        updateSpendingWarningLimit: (newLimit) => updateSpendingWarningMutation.mutateAsync(newLimit),
        removeSpendingWarningLimit: () => removeSpendingWarningMutation.mutateAsync(),
        deposit: (amount, bankId) => depositMutation.mutateAsync({ amount, bankId }),
        withdraw: (amount, bankId) => withdrawMutation.mutateAsync({ amount, bankId }),
        fetchTransactions,
        checkBalance,
        refreshWallet,
    };
};
