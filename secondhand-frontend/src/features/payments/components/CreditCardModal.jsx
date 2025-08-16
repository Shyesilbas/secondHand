import React from 'react';
import CreditCardCreateForm from './CreditCardCreateForm';

const CreditCardModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Add New Credit Card</h3>
                <CreditCardCreateForm
                    onSuccess={onClose}
                    onCancel={onClose}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default CreditCardModal;
