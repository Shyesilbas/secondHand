export const useCreditCard = () => ({
  creditCards: [],
  isLoading: false,
  isDeleting: false,
  error: null,
  createCreditCard: async () => {
    throw new Error('Credit card payments are disabled.');
  },
  deleteCreditCard: async () => {
    throw new Error('Credit card payments are disabled.');
  },
  refetch: async () => [],
});

export const useBankAccountMutations = () => ({
  createBankAccount: async () => {
    throw new Error('Bank accounts are disabled.');
  },
  deleteBankAccount: async () => {
    throw new Error('Bank accounts are disabled.');
  },
  isCreating: false,
  isDeleting: false,
});

export const usePaymentMethods = () => ({
  paymentMethods: {
    creditCards: [],
    bankAccounts: [],
  },
  isLoading: false,
  refetch: async () => ({ creditCards: [], bankAccounts: [] }),
});
