import React, {useEffect, useState} from 'react';
import {COMPLAINT_REASONS} from '../types/complaintTypes.js';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {AlertCircle, Loader2, ShieldCheck, X} from 'lucide-react';
import logger from '../../common/utils/logger.js';

const ComplaintModal = ({
                            isOpen,
                            onClose,
                            onSubmit,
                            targetUserName,
                            targetUserId,
                            listingId,
                            listingTitle,
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

    const { user: currentUser } = useAuthState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            logger.error('User must be logged in to submit a complaint.');
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
            logger.error('Complaint submission failed:', error);
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                                {listingId ? 'Report Listing' : 'Report User'}
                            </h3>
                            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200/60">
                                <p className="text-sm text-slate-600 tracking-tight">
                                    {listingId && listingTitle ? (
                                        <>You are reporting "<span className="font-semibold text-slate-900">{listingTitle}</span>"</>
                                    ) : (
                                        <>You are reporting <span className="font-semibold text-slate-900">{targetUserName}</span></>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold tracking-tight text-slate-700 mb-2.5">
                                Reason *
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.reason}
                                    onChange={(e) => handleInputChange('reason', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-2xl tracking-tight text-slate-900 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${
                                        errors.reason ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    disabled={isLoading}
                                >
                                    <option value="">Select a reason...</option>
                                    {COMPLAINT_REASONS.map(reason => (
                                        <option key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.reason && (
                                    <div className="mt-2 flex items-center gap-1.5 text-sm text-rose-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.reason}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold tracking-tight text-slate-700 mb-2.5">
                                Detailed Description *
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={5}
                                    className={`w-full px-4 py-3 border rounded-2xl tracking-tight text-slate-900 bg-white resize-none transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${
                                        errors.description ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="Please explain your complaint in detail..."
                                    disabled={isLoading}
                                    maxLength={500}
                                />
                                <div className="mt-2 flex items-start justify-between">
                                    {errors.description ? (
                                        <div className="flex items-center gap-1.5 text-sm text-rose-600">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <span>{errors.description}</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 tracking-tight">
                                            A detailed explanation helps us resolve your complaint faster
                                        </p>
                                    )}
                                    <p className="text-xs font-mono text-slate-400 tracking-tight">
                                        {formData.description.length}/500
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl border border-slate-200/60 px-4 py-4 mt-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ShieldCheck className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold tracking-tight text-slate-900 mb-1.5">
                                        How does the complaint process work?
                                    </h4>
                                    <p className="text-xs text-slate-600 leading-relaxed tracking-tight">
                                        We will review your complaint and get back to you. Our support team investigates each case thoroughly and responds within 24-48 hours.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-semibold tracking-tight text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !formData.reason || !formData.description.trim()}
                                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-tight text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <span>Submit Complaint</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ComplaintModal;
