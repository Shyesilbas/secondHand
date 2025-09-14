import { useState, useEffect } from 'react';
import { ewalletService } from '../services/ewalletService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const useEWallet = () => {
    const [eWallet, setEWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    // Get eWallet information
    const fetchEWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            const walletData = await ewalletService.getEWallet();
            setEWallet(walletData);
        } catch (err) {
            if (err.response?.status === 404) {
                // eWallet doesn't exist, user needs to create one
                setEWallet(null);
            } else {
                setError(err.message || 'Failed to fetch eWallet');
                showNotification('Failed to fetch eWallet information', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Create eWallet
    const createEWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            const walletData = await ewalletService.createEWallet();
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

    // Update eWallet limits
    const updateLimits = async (newLimit) => {
        setLoading(true);
        setError(null);
        try {
            const updatedWallet = await ewalletService.updateLimits(newLimit);
            setEWallet(updatedWallet);
            showNotification('eWallet limit updated successfully', 'success');
            return updatedWallet;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update limit';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Deposit money
    const deposit = async (amount, bankId) => {
        setLoading(true);
        setError(null);
        try {
            const transaction = await ewalletService.deposit(amount, bankId);
            // Refresh wallet data
            await fetchEWallet();
            showNotification(`Successfully deposited ${amount} TL`, 'success');
            return transaction;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to deposit';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Withdraw money
    const withdraw = async (amount, bankId) => {
        setLoading(true);
        setError(null);
        try {
            const transaction = await ewalletService.withdraw(amount, bankId);
            // Refresh wallet data
            await fetchEWallet();
            showNotification(`Successfully withdrew ${amount} TL`, 'success');
            return transaction;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to withdraw';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get transactions
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

    // Check balance
    const checkBalance = async (amount) => {
        try {
            return await ewalletService.checkBalance(amount);
        } catch (err) {
            console.error('Error checking balance:', err);
            return false;
        }
    };

    // Initialize on mount
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
        deposit,
        withdraw,
        fetchTransactions,
        checkBalance,
        refreshWallet: fetchEWallet
    };
};
