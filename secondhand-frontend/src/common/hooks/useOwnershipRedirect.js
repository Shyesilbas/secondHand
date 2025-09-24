import { useEffect } from 'react';
import { ROUTES } from '../constants/routes.js';

export const useOwnershipRedirect = (entity, isOwner, notification, navigate) => {
    useEffect(() => {
                if (entity === null) {
            return;
        }

        if (!isOwner) {
            notification.showError('Unauthorized', 'You do not have permission to view this page.');
            navigate(ROUTES.HOME);
        }
    }, [entity, isOwner, notification, navigate]);
};
