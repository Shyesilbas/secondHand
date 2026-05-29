import {useCallback, useMemo, useState} from 'react';
import {RegisterRequestDTO} from '../auth.js';
import {authService} from '../services/authService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useRegisterAgreements} from '../../agreements/hooks/useRegisterAgreements.js';
import {validateRegisterForm} from '../utils/registerValidator.js';
import {useGenderEnum} from '../../common/hooks/useGenderEnum.js';
import {formatPhoneNumber} from '../../common/utils/phoneFormatter.js';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({ ...RegisterRequestDTO, confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const notification = useNotification();

  const agreementsApi = useRegisterAgreements();
  const { genders: genderOptions, isLoading: gendersLoading } = useGenderEnum();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Special handling for birthdate to format DD/MM/YYYY
    if (name === 'birthdate') {
      const prevValue = formData.birthdate || '';
      const isDeleting = value.length < prevValue.length;
      let formattedValue = value;

      if (!isDeleting) {
        // Strip all non-digits
        const clean = value.replace(/\D/g, '').substring(0, 8);
        const day = clean.substring(0, 2);
        const month = clean.substring(2, 4);
        const year = clean.substring(4, 8);

        if (clean.length > 4) {
          formattedValue = `${day}/${month}/${year}`;
        } else if (clean.length > 2) {
          formattedValue = `${day}/${month}`;
        } else {
          formattedValue = clean;
        }
      } else {
        // If deleting a slash, delete the character before it as well to prevent loops
        if (prevValue.endsWith('/') && value.length === prevValue.length - 1) {
          formattedValue = value.slice(0, -1);
        }
      }
      
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
      const response = await authService.register(registerData);

      notification.showSuccess('Account Created', 'Your account has been created. You can now log in with your credentials.');
      navigate(ROUTES.LOGIN, { state: { message: 'Your account has been created. You can now log in with your credentials.' } });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      notification.showError('Error', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, agreementsApi.acceptedAgreements, agreementsApi.agreements, notification, navigate]);

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
