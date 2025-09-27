import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const agreementService = {
    getAllAgreements: async () => {
        return get(API_ENDPOINTS.AGREEMENTS.ALL);
    },

    getAgreementByType: async (agreementType) => {
        return get(API_ENDPOINTS.AGREEMENTS.BY_TYPE(agreementType));
    },

    getRequiredAgreements: async (agreementGroup) => {
        return get(API_ENDPOINTS.AGREEMENTS.REQUIRED, { 
            params: { agreementGroup } 
        });
    }
};
