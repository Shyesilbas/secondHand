import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useComplaints } from '../hooks/useComplaints.js';
import ComplaintModal from './ComplaintModal.jsx';

const ComplaintButton = ({ targetUserId, targetUserName, targetUser, listingId, className = "" }) => {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: currentUser } = useAuth();
    const { createComplaint } = useComplaints();

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
            <ExclamationTriangleIcon
                onClick={() => setShowModal(true)}
                className={`w-6 h-6 cursor-pointer ${className}`}
                title={`Report ${targetUserName}`}
            />

            <ComplaintModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleComplaint}
                targetUserName={targetUserName}
                isLoading={isSubmitting}
            />
        </>
    );
};

export default ComplaintButton;
