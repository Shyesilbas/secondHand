import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { compressImage } from '../../common/utils/imageOptimizer.js';
import { ComplaintDto, createComplaintRequest, isValidComplaintDto } from '../types/complaintTypes.js';

const toDto = (response) => {
  const dto = new ComplaintDto(response);
  if (!isValidComplaintDto(dto)) throw new Error('Invalid complaint response');
  return dto;
};

const toList = (response) => (Array.isArray(response) ? response.map((item) => new ComplaintDto(item)) : []);

export const createComplaint = async (data) => toDto(await post(API_ENDPOINTS.COMPLAINTS.CREATE, createComplaintRequest(data)));

export const getMyComplaints = async () => toList(await get(API_ENDPOINTS.COMPLAINTS.MY_COMPLAINTS));

export const getReceivedComplaints = async () => toList(await get(API_ENDPOINTS.COMPLAINTS.RECEIVED));

export const submitAppeal = async ({ complaintId, reason }) =>
  toDto(await post(API_ENDPOINTS.COMPLAINTS.APPEAL(complaintId), { reason: reason.trim() }));

export const getMyRestriction = () => get(API_ENDPOINTS.COMPLAINTS.MY_RESTRICTION);

/** Uploads one evidence image through the platform image service and returns its URL. */
export const uploadEvidenceImage = async (file) => {
  const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
  const formData = new FormData();
  formData.append('image', compressed);
  const response = await post(API_ENDPOINTS.IMAGES.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  if (!response?.imageUrl) throw new Error('Upload returned no image URL');
  return response.imageUrl;
};
