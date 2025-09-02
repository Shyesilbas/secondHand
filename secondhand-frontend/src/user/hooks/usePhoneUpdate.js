import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { userService } from '../services/userService.js';
import { UpdatePhoneRequestDTO } from '../users.js';

export const usePhoneUpdate = () => {
    const { updateUser } = useAuth();
    const notification = useNotification();
    const [isUpdating, setIsUpdating] = useState(false);

    const updatePhone = async (phoneFormData) => {
        const cleanPhone = phoneFormData.newPhone.replace(/\D/g, '');

        if (!phoneFormData.newPhone.trim()) {
            notification.showError('Error', 'Please enter a phone number');
            return false;
        }

        if (cleanPhone.length !== 11) {
            notification.showError('Error', 'Phone number must be 11 digits');
            return false;
        }

        setIsUpdating(true);
        try {
            await userService.updatePhone({
                newPhone: cleanPhone,
                password: phoneFormData.password
            });

            updateUser({ phoneNumber: cleanPhone });
            notification.showSuccess('Success', 'Phone number updated successfully. Please refresh the page to see the changes.');
            return true;
        } catch (error) {
            notification.showError('Error', error.response?.data?.message || error.message || 'An error occurred while updating phone number. Please try again.');
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updatePhone,
        isUpdating
    };
};
