import React, { useState, useRef } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useComplaints } from '../hooks/useComplaints.js';
import ComplaintModal from './ComplaintModal.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useLocation, useNavigate } from 'react-router-dom';

const ComplaintButton = ({ targetUserId, targetUserName, targetUser, listingId, listingTitle, className = "" }) => {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: currentUser, isAuthenticated } = useAuth();
    const { createComplaint } = useComplaints();
    const notification = useNotification();
    const location = useLocation();
    const navigate = useNavigate();
    const notificationShown = useRef(false);

    const handleReportClick = () => {
        if (!isAuthenticated) {
            if (!notificationShown.current) {
                notificationShown.current = true;
                notification.addNotification({
                    type: 'info',
                    title: 'Authentication Required',
                    message: 'Please Log In',
                    autoClose: false,
                    showCloseButton: false,
                    actions: [
                        {
                            label: 'Cancel',
                            primary: false,
                            onClick: () => {
                                notificationShown.current = false;
                            }
                        },
                        {
                            label: 'OK',
                            primary: true,
                            onClick: () => {
                                navigate(ROUTES.LOGIN, { 
                                    state: { from: location },
                                    replace: true 
                                });
                                notificationShown.current = false;
                            }
                        }
                    ]
                });
            }
            return;
        }
        setShowModal(true);
    };

    const handleComplaint = async (complaintData) => {
        if (!currentUser?.id) throw new Error('User not authenticated');
        if (!targetUser?.id && !targetUserId) throw new Error('Target user not found');

        setIsSubmitting(true);
        try {
            await createComplaint({
                complainerId: currentUser.id,
                complainedUserId: targetUser?.id || targetUserId,
                listingId,
                reason: complaintData.reason,
                description: complaintData.description
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={handleReportClick}
                className={`inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm ${className}`}
                title={`Report ${targetUserName}`}
            >
                <ExclamationTriangleIcon className="w-4 h-4" />
                Report
            </button>

            <ComplaintModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleComplaint}
                targetUserName={targetUserName}
                targetUserId={targetUserId}
                listingId={listingId}
                listingTitle={listingTitle}
                isLoading={isSubmitting}
            />
        </>
    );
};

export default ComplaintButton;
