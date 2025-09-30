import { useState, useEffect } from 'react';
import { ewalletService } from '../services/ewalletService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const useEWallet = () => {
    const [eWallet, setEWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

        const fetchEWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            const walletData = await ewalletService.getEWallet();
            setEWallet(walletData);
        } catch (err) {
            if (err.response?.status === 404) {
                                setEWallet(null);
            } else {
                setError(err.message || 'Failed to fetch eWallet');
                showNotification('Failed to fetch eWallet information', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

        const createEWallet = async (options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                limit: options.limit ?? 1000,
                spendingWarningLimit: options.spendingWarningLimit ?? 200
            };
            const walletData = await ewalletService.createEWallet(payload);
            setEWallet(walletData);
            showNotification('eWallet created successfully', 'success');
            return walletData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create eWallet';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

        const updateLimits = async (newLimit) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await ewalletService.updateLimits(newLimit);
            setEWallet(updated);
            showNotification('Limit updated successfully', 'success');
            return updated;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update limit';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSpendingWarningLimit = async (newLimit) => {
        setLoading(true);
        setError(null);
        try {
            await ewalletService.updateSpendingWarningLimit(newLimit);
            await fetchEWallet();
            showNotification('Spending warning limit updated', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update spending warning limit';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeSpendingWarningLimit = async () => {
        setLoading(true);
        setError(null);
        try {
            await ewalletService.removeSpendingWarningLimit();
            await fetchEWallet();
            showNotification('Spending warning limit removed', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to remove spending warning limit';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

        const deposit = async (amount, bankId) => {
        setLoading(true);
        setError(null);
        try {
            await ewalletService.deposit(amount, bankId);
            showNotification('Deposit successful', 'success');
            await fetchEWallet();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to deposit';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

        const withdraw = async (amount, bankId) => {
        setLoading(true);
        setError(null);
        try {
            await ewalletService.withdraw(amount, bankId);
            showNotification('Withdrawal successful', 'success');
            await fetchEWallet();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to withdraw';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

        const fetchTransactions = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const transactionData = await ewalletService.getTransactions(page, size);
            setTransactions(transactionData.content || transactionData);
            return transactionData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch transactions';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

        const checkBalance = async (amount) => {
        try {
            return await ewalletService.checkBalance(amount);
        } catch (err) {
            console.error('Error checking balance:', err);
            return false;
        }
    };

        useEffect(() => {
        fetchEWallet();
    }, []);

    return {
        eWallet,
        transactions,
        loading,
        error,
        createEWallet,
        updateLimits,
        updateSpendingWarningLimit,
        removeSpendingWarningLimit,
        deposit,
        withdraw,
        fetchTransactions,
        checkBalance,
        refreshWallet: fetchEWallet
    };
};
