import React, { useState, useEffect } from 'react';
import { COMPLAINT_REASONS } from '../types/complaintTypes.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const ComplaintModal = ({
                            isOpen,
                            onClose,
                            onSubmit,
                            targetUserName,
                            targetUserId,
                            listingId,
                            isLoading
                        }) => {
    const [formData, setFormData] = useState({
        reason: '',
        description: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({ reason: '', description: '' });
            setErrors({});
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.reason.trim()) {
            newErrors.reason = 'You must select a reason';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { user: currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            console.error('User must be logged in to submit a complaint.');
            return;
        }

        if (!validateForm()) return;

        const complaintData = {
            complainerId: currentUser.id,
            complainedUserId: targetUserId,
            listingId,
            reason: formData.reason,
            description: formData.description.trim(),
        };

        try {
            await onSubmit(complaintData);
            onClose();
        } catch (error) {
            console.error('Complaint submission failed:', error);
        }
    };


    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-text-primary">
                                Report User
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">
                                You are reporting {targetUserName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-text-muted hover:text-text-secondary p-1"
                            disabled={isLoading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Reason *
                            </label>
                            <select
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.reason ? 'border-red-500' : 'border-header-border'
                                }`}
                                disabled={isLoading}
                            >
                                <option value="">Select...</option>
                                {COMPLAINT_REASONS.map(reason => (
                                    <option key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </option>
                                ))}
                            </select>
                            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Detailed Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                                    errors.description ? 'border-red-500' : 'border-header-border'
                                }`}
                                placeholder="Please explain your complaint in detail..."
                                disabled={isLoading}
                                maxLength={500}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.description ? (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                ) : (
                                    <p className="text-sm text-text-muted">
                                        A detailed explanation helps us resolve your complaint faster
                                    </p>
                                )}
                                <p className="text-sm text-text-muted">
                                    {formData.description.length}/500
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-sm text-yellow-800">
                                    We will review your complaint and get back to you.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-text-secondary hover:text-gray-800 font-medium disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !formData.reason || !formData.description.trim()}
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium flex items-center"
                            >
                                {isLoading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isLoading ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ComplaintModal;
