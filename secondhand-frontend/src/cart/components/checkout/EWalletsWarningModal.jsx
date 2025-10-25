import React from 'react';

const EWalletsWarningModal = React.memo(({ showEWalletWarning, onClose, onConfirmEWalletWarning }) => {
    if (!showEWalletWarning) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
                <div className="bg-gray-900 px-6 py-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Spending Warning
                    </h4>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-6">
                        Your eWallet spending warning limit has been reached or exceeded with this purchase. Do you want to proceed?
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 font-medium transition-colors"
                            onClick={onConfirmEWalletWarning}
                        >
                            Proceed Anyway
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

EWalletsWarningModal.displayName = 'EWalletsWarningModal';

export default EWalletsWarningModal;
