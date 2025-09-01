import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../constants/routes';

export const useFormSubmission = (config) => {
  const {
    submitFunction,
    validateAll,
    formState,
    successMessage = 'Listing created successfully!',
    errorMessage = 'An error occurred while creating the listing',
    redirectRoute = ROUTES.MY_LISTINGS,
    onSuccess,
    onError
  } = config;

  const navigate = useNavigate();
  const notification = useNotification();
  const { formData, errors, goToStep } = formState;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateAll(formData)) {
      notification.showError('Missing Information', 'Please fill in all required fields. Location information is especially required!');

      // Navigate to first step with errors
      const errorFields = Object.keys(errors);
      if (errorFields.some(field => ['title', 'description', 'price'].includes(field))) {
        goToStep(1);
      } else if (errorFields.some(field => ['brand', 'model', 'year', 'fuelType', 'adType', 'realEstateType', 'heatingType', 'ownerType', 'squareMeters', 'roomCount'].includes(field))) {
        goToStep(2);
      } else if (errorFields.some(field => ['city', 'district'].includes(field))) {
        goToStep(3);
      }
      return;
    }

    try {
      await submitFunction(formData);
      notification.showSuccess('Success', successMessage);
      
      if (onSuccess) {
        onSuccess(formData);
      } else {
        navigate(redirectRoute);
      }
    } catch (error) {
      notification.showError('Error', errorMessage);
      
      if (onError) {
        onError(error);
      }
    }
  }, [submitFunction, validateAll, formData, errors, goToStep, notification, successMessage, errorMessage, redirectRoute, navigate, onSuccess, onError]);

  return {
    handleSubmit
  };
};
