import { useQuery } from '@tanstack/react-query';
import { agreementService } from '../services/agreementService.js';

const AGREEMENT_KEYS = {
    all: ['agreements'],
    allAgreements: () => [...AGREEMENT_KEYS.all, 'all'],
    byType: (type) => [...AGREEMENT_KEYS.all, 'type', type],
    required: (group) => [...AGREEMENT_KEYS.all, 'required', group]
};

export const useAgreements = (options = {}) => {
    const {
        data: agreements = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: AGREEMENT_KEYS.allAgreements(),
        queryFn: agreementService.getAllAgreements,
        enabled: options.enabled ?? true,
        staleTime: 60 * 60 * 1000, // 1 hour
        cacheTime: 2 * 60 * 60 * 1000, // 2 hours
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        retry: 1,
        retryDelay: 1000,
        onError: (error) => {
            console.debug('Agreements fetch failed:', error.message);
        }
    });

    return {
        agreements,
        isLoading,
        error,
        refetch
    };
};

export const useAgreementByType = (agreementType) => {
    const {
        data: agreement,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: AGREEMENT_KEYS.byType(agreementType),
        queryFn: () => agreementService.getAgreementByType(agreementType),
        enabled: !!agreementType,
        staleTime: 30 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        onError: (error) => {
            console.debug(`Agreement ${agreementType} fetch failed:`, error.message);
        }
    });

    return {
        agreement,
        isLoading,
        error,
        refetch
    };
};

export const useUserAgreements = () => {
    const {
        data: userAgreements = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: [...AGREEMENT_KEYS.all, 'user'],
        queryFn: agreementService.getUserAgreements,
        staleTime: 30 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        onError: (error) => {
            console.debug('User agreements fetch failed:', error.message);
        }
    });

    return {
        userAgreements,
        isLoading,
        error,
        refetch
    };
};

export { AGREEMENT_KEYS };
