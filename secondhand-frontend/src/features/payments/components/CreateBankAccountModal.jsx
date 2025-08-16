import React from 'react';

const CreateBankAccountModal = ({ isOpen, onClose, onCreate, isCreating }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Create New Bank Account</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">
                                Automatic Account Creation
                            </h4>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>System will automatically generate an IBAN for you</li>
                                    <li>Your name and surname will be used as account holder</li>
                                    <li>Initial balance will be set to 0 TRY</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 mb-6">
                    Are you sure you want to create a bank account?
                </p>
                
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        disabled={isCreating}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onCreate}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateBankAccountModal;
