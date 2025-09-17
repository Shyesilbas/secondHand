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
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
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
