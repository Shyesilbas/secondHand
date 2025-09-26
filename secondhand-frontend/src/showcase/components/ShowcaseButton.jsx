import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import ShowcaseModal from './ShowcaseModal.jsx';

const ShowcaseButton = ({ listingId, onSuccess }) => {
    const { isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Add to Showcase
            </button>
            
            <ShowcaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                listingId={listingId}
                onSuccess={onSuccess}
            />
        </>
    );
};

export default ShowcaseButton;
