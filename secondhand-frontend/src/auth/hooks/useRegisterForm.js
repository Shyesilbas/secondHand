import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import { RegisterRequestDTO } from '../auth.js';
import { authService } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useRegisterAgreements } from '../../agreements/hooks/useRegisterAgreements.js';
import { validateRegisterForm } from '../utils/registerValidator.js';
import { useGenderEnum } from '../../common/hooks/useGenderEnum.js';
import { formatPhoneNumber } from '../../common/utils/phoneFormatter.js';
import { formatBirthdateInput } from '../../common/utils/dateFormat.js';

export const useRegisterForm = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ ...RegisterRequestDTO, confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const agreementsApi = useRegisterAgreements();
    const { genders: genderOptions, isLoading: gendersLoading } = useGenderEnum();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        // Special handling for birthdate to format DD/MM/YYYY
        if (name === 'birthdate') {
            const formattedValue = formatBirthdateInput(value, formData.birthdate || '');
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        }
        // Special handling for phone number formatting
        else if (name === 'phone') {
            const formattedPhone = formatPhoneNumber(value, true);
            setFormData(prev => ({ ...prev, [name]: formattedPhone }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }, [errors, formData.birthdate]);

    const validateForm = useCallback(() => {
        const newErrors = validateRegisterForm(formData, agreementsApi.acceptedAgreements, agreementsApi.agreements);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, agreementsApi.acceptedAgreements, agreementsApi.agreements]);

    const submit = useCallback(async () => {
        if (!validateForm()) return false;
        setIsLoading(true);
        try {
            const registerData = {
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                email: formData.email.trim(),
                password: formData.password,
                gender: formData.gender,
                phoneNumber: formData.phone || '',
                birthdate: formData.birthdate,
                agreementsAccepted: agreementsApi.acceptedAgreements.size === agreementsApi.agreements.length,
                acceptedAgreementIds: Array.from(agreementsApi.acceptedAgreements),
            };
            await authService.register(registerData);
            navigate(ROUTES.LOGIN, { state: { message: t('account_created_login_hint', 'Hesabın oluşturuldu. Şimdi e-posta ve şifrenle giriş yapabilirsin.') } });
            return true;
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || t('registration_failed_retry', 'Kayıt tamamlanamadı. Lütfen tekrar dene.') });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [validateForm, formData, agreementsApi.acceptedAgreements, agreementsApi.agreements, navigate, t]);

    return useMemo(() => ({
        formData,
        setFormData,
        errors,
        setErrors,
        isLoading,
        genderOptions,
        gendersLoading,
        handleChange,
        validateForm,
        submit,
        ...agreementsApi
    }), [formData, errors, isLoading, genderOptions, gendersLoading, handleChange, validateForm, submit, agreementsApi]);
};

export default useRegisterForm;
