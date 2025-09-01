import {useCallback, useEffect, useMemo, useState} from 'react';
import {RegisterRequestDTO} from '../../../types/auth';
import {enumService} from '../../../services/enumService';
import {authService} from '../services/authService';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../../constants/routes';
import {useRegisterAgreements} from '../../../agreements/hooks/useRegisterAgreements.js';
import {validateRegisterForm} from '../../../utils/validators/registerValidator';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({ ...RegisterRequestDTO, confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [genderOptions, setGenderOptions] = useState([]);

  const navigate = useNavigate();
  const notification = useNotification();

  const agreementsApi = useRegisterAgreements();

  useEffect(() => {
    const loadGenders = async () => {
      try {
        const genders = await enumService.getGenders();
        setGenderOptions(Array.isArray(genders) ? genders : []);
      } catch {
        setGenderOptions([]);
      }
    };
    loadGenders();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        phoneNumber: formData.phone?.replace(/\s/g, '') || '',
        agreementsAccepted: agreementsApi.acceptedAgreements.size === agreementsApi.agreements.length
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
    handleChange,
    validateForm,
    submit,
    ...agreementsApi
  }), [formData, errors, isLoading, genderOptions, handleChange, validateForm, submit, agreementsApi]);
};

export default useRegisterForm;


