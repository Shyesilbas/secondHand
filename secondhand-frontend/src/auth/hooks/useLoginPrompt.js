import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';

/** Returns a function that asks a signed-out user to sign in; the prompt is shown once until it is answered. */
export const useLoginPrompt = ({ onCancel } = {}) => {
 const { addNotification } = useNotification();
 const navigate = useNavigate();
 const location = useLocation();
 const openRef = useRef(false);

 return useCallback(() => {
 if (openRef.current) return;
 openRef.current = true;
 addNotification({
 type: 'info',
 title: 'Sign in required',
 message: 'Please sign in to continue.',
 autoClose: false,
 showCloseButton: false,
 actions: [{
 label: 'Cancel',
 primary: false,
 onClick: () => {
 openRef.current = false;
 onCancel?.();
 }
 }, {
 label: 'Sign in',
 primary: true,
 onClick: () => {
 openRef.current = false;
 navigate(ROUTES.LOGIN, { state: { from: location }, replace: true });
 }
 }]
 });
 }, [addNotification, location, navigate, onCancel]);
};
