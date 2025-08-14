import React, { useState } from 'react';
import { CreditCardRequestDTO, createCreditCardRequest } from '../../../types/payments';
import { formatCurrency } from '../../../utils/formatters';
import { useNotification } from '../../../context/NotificationContext';

const CreditCardCreateForm = ({ onSuccess, onCancel, isLoading, onSubmit }) => {
  const notification = useNotification();
  const [formData, setFormData] = useState({
    ...CreditCardRequestDTO,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow positive numbers for limit
    if (name === 'limit') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const limitValue = parseFloat(formData.limit);
    if (!formData.limit || isNaN(limitValue) || limitValue <= 0) {
      newErrors.limit = 'Enter a valid limit. Limit must be greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notification.showError('Error', 'Please fill in all required fields. Limit must be greater than 0.');
      return;
    }

    try {
      // Use DTO creator to validate and transform data
      const creditCardData = createCreditCardRequest(formData);
      
      await onSubmit(creditCardData);
      notification.showSuccess('Success', 'Credit Card Created Successfully!');
      
      // Reset form
      setFormData({ ...CreditCardRequestDTO });
      setErrors({});
      
      if (onSuccess) onSuccess();
    } catch (error) {
      notification.showError('Error', 'An error occurred while creating the credit card');
    }
  };

  const formatAmount = (value) => formatCurrency(value || 0, 'TRY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Credit Card
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Enter the limit you want</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Credit Limit *
        </label>
        <div className="relative">
          <input
            type="text"
            name="limit"
            value={formData.limit}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.limit ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">TL</span>
          </div>
        </div>
        {errors.limit && (
          <p className="text-red-500 text-sm mt-1">{errors.limit}</p>
        )}
        {formData.limit && !errors.limit && (
          <p className="text-gray-600 text-sm mt-1">
            Limit: {formatAmount(formData.limit)}
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creation...' : 'Create Credit Card'}
        </button>
      </div>
    </form>
  );
};

export default CreditCardCreateForm;