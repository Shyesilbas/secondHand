import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const ClearCartModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isClearing = false 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <TrashIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Clear Cart</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to remove all items from your cart? This action cannot be undone.
                    </p>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isClearing}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isClearing}
                            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isClearing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Clearing...</span>
                                </>
                            ) : (
                                <span>Clear Cart</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClearCartModal;
