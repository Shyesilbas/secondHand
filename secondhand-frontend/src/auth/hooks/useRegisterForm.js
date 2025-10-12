import {useCallback, useMemo, useState} from 'react';
import {RegisterRequestDTO} from '../auth.js';
import {authService} from '../services/authService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useRegisterAgreements} from '../../agreements/hooks/useRegisterAgreements.js';
import {validateRegisterForm} from '../registerValidator.js';
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
      // Remove all non-numeric characters
      let formattedValue = value.replace(/\D/g, '');
      
      // Add slashes at appropriate positions
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9);
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
  }, [errors]);

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

      if (response.welcomeMessage) notification.showSuccess('Register Successful', response.welcomeMessage);
      if (response.importantMessage) notification.showInfo('Important', response.importantMessage);
      if (response.informationMessage) notification.showInfo('Information', response.informationMessage);

      navigate(ROUTES.LOGIN, { state: { message: 'Registration successful! You can now log in.' } });
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


