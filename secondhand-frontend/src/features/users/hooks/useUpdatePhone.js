import { useState } from 'react';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { userService } from '../services/userService';
import { useAuth } from '../../../context/AuthContext';
import { UpdatePhoneRequestDTO } from '../../../types/users';

export const useUpdatePhone = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({ ...UpdatePhoneRequestDTO });
    const [isOpen, setIsOpen] = useState(false);

    const notification = useNotification();
    const { updateUser } = useAuth();

    const validate = (newPhone, password) => {
        const cleanPhone = (newPhone || '').replace(/\D/g, '');

        if (!cleanPhone) {
            notification.showError('Error', 'Please enter a phone number');
            return { valid: false };
        }
        if (cleanPhone.length !== 11) {
            notification.showError('Error', 'Phone number must be 11 digits');
            return { valid: false };
        }
        if (!password?.trim()) {
            notification.showError('Error', 'Please enter your password');
            return { valid: false };
        }
        return { valid: true, cleanPhone };
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        const { valid, cleanPhone } = validate(formData.newPhone, formData.password);
        if (!valid) return;

        setIsUpdating(true);
        try {
            await userService.updatePhone({ newPhone: cleanPhone, password: formData.password });
            updateUser({ phoneNumber: cleanPhone });
            notification.showSuccess('Success', 'Phone number updated successfully.');
            setFormData({ ...UpdatePhoneRequestDTO });
            setIsOpen(false);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An error occurred while updating phone number. Please try again.';
            notification.showError('Error', message);
        } finally {
            setIsUpdating(false);
        }
    };

    const openModal = (currentPhone = '') => {
        setFormData(prev => ({ ...prev, newPhone: currentPhone || '' }));
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return { openModal, Modal: { isOpen, formData, handleChange, submit, closeModal, isUpdating } };
};
