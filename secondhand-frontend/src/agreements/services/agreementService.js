import { get, post } from '../../common/services/api/request.js';
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
    },

    getRequiredAgreementsForRegister: async () => {
        return get(`${API_ENDPOINTS.AGREEMENTS.REQUIRED}?agreementGroup=REGISTER`);
    },

    acceptAgreement: async (acceptRequest) => {
        return post(API_ENDPOINTS.AGREEMENTS.ACCEPT, acceptRequest);
    },

    getUserAgreements: async () => {
        const data = await get(API_ENDPOINTS.AGREEMENTS.USER_AGREEMENTS);
        return Array.isArray(data) ? data.map((ua) => ({
            ...ua,
            isAcceptedTheLastVersion: ua?.isAcceptedTheLastVersion ?? ua?.acceptedTheLastVersion ?? false,
        })) : [];
    }
};
