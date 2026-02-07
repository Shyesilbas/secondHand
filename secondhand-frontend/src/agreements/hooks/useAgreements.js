import { useQuery } from '@tanstack/react-query';
import { agreementService } from '../services/agreementService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

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
    const { user, isAuthenticated } = useAuth();
    const {
        data: userAgreements = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: [...AGREEMENT_KEYS.all, 'user', user?.id],
        queryFn: agreementService.getUserAgreements,
        enabled: !!(isAuthenticated && user?.id),
        staleTime: 30 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        onError: (error) => {
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
