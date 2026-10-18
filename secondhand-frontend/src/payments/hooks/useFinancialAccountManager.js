

export const usePaymentMethods = () => ({
 paymentMethods: {
 creditCards: [],
 bankAccounts: [],
 },
 isLoading: false,
 refetch: async () => ({ creditCards: [], bankAccounts: [] }),
});
