import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { ComplaintDto, createComplaintRequest, isValidComplaintDto } from '../types/complaintTypes.js';

export const createComplaint = async (data) => {
    const requestPayload = createComplaintRequest(data);
    const response = await post(API_ENDPOINTS.COMPLAINTS.CREATE, requestPayload);
    const dto = new ComplaintDto(response);
    if (!isValidComplaintDto(dto)) throw new Error('Invalid complaint response');
    return dto;
};

export const getMyComplaints = async () => {
    const response = await get(API_ENDPOINTS.COMPLAINTS.MY_COMPLAINTS);
    if (!Array.isArray(response)) return [];
    return response.map(item => new ComplaintDto(item));
};

export const getComplaintsAboutMe = async () => {
    const response = await get(API_ENDPOINTS.COMPLAINTS.ABOUT_ME);
    if (!Array.isArray(response)) return [];
    return response.map(item => new ComplaintDto(item));
};
