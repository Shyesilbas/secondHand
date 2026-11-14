import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComplaint,
  getMyComplaints,
  getMyRestriction,
  getReceivedComplaints,
  submitAppeal,
} from '../services/complaintService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { COMPLAINT_DEFAULTS, COMPLAINT_KEYS, COMPLAINT_MESSAGES } from '../complaintConstants.js';
import { getComplaintErrorMessage } from '../utils/complaintError.js';

const LIST_OPTIONS = {
  staleTime: COMPLAINT_DEFAULTS.STALE_TIME_MS,
  gcTime: COMPLAINT_DEFAULTS.GC_TIME_MS,
  refetchOnWindowFocus: false,
};

export const useMyComplaints = ({ enabled = true } = {}) =>
  useQuery({ queryKey: COMPLAINT_KEYS.my(), queryFn: getMyComplaints, enabled, ...LIST_OPTIONS });

export const useReceivedComplaints = ({ enabled = true } = {}) =>
  useQuery({ queryKey: COMPLAINT_KEYS.received(), queryFn: getReceivedComplaints, enabled, ...LIST_OPTIONS });

export const useMyRestriction = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: COMPLAINT_KEYS.restriction(),
    queryFn: getMyRestriction,
    enabled,
    staleTime: COMPLAINT_DEFAULTS.RESTRICTION_STALE_TIME_MS,
  });

export const useCreateComplaint = () => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.my() });
      showNotification({
        type: 'success',
        title: COMPLAINT_MESSAGES.SUBMITTED_TITLE,
        message: COMPLAINT_MESSAGES.SUBMITTED_SUCCESS,
      });
    },
    onError: (err) => {
      showNotification({
        type: 'error',
        title: COMPLAINT_MESSAGES.SUBMIT_FAILED_TITLE,
        message: getComplaintErrorMessage(err),
      });
    },
  });
};

export const useSubmitAppeal = () => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAppeal,
    onSuccess: (updated) => {
      queryClient.setQueryData(COMPLAINT_KEYS.received(), (list) =>
        Array.isArray(list) ? list.map((c) => (c.complaintId === updated.complaintId ? updated : c)) : list);
      showNotification({
        type: 'success',
        title: COMPLAINT_MESSAGES.APPEAL_SUBMITTED_TITLE,
        message: COMPLAINT_MESSAGES.APPEAL_SUBMITTED_SUCCESS,
      });
    },
    onError: (err) => {
      showNotification({
        type: 'error',
        title: COMPLAINT_MESSAGES.APPEAL_FAILED_TITLE,
        message: getComplaintErrorMessage(err, COMPLAINT_MESSAGES.APPEAL_FAILED_FALLBACK),
      });
    },
  });
};
