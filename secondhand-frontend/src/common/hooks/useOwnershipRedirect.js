import { useEffect } from 'react';
import { ROUTES } from '../constants/routes.js';

export const useOwnershipRedirect = (entity, isOwner, notification, navigate) => {
    useEffect(() => {
        // Wait until entity is loaded to make a decision.
        if (entity === null) {
            return;
        }

        if (!isOwner) {
            notification.showError('Unauthorized', 'You do not have permission to view this page.');
            navigate(ROUTES.HOME);
        }
    }, [entity, isOwner, notification, navigate]);
};
