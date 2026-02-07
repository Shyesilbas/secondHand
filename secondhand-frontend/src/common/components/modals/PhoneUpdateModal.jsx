import { formatPhoneNumber } from '../../utils/phoneFormatter.js';

const PhoneUpdateModal = ({ isOpen, formData, handleChange, submit, closeModal, isUpdating }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Update Phone Number</h3>
                    <button onClick={closeModal} className="text-text-muted hover:text-text-secondary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">New Phone Number</label>
                        <input
                            type="tel"
                            value={formData.newPhone}
                            onChange={(e) => {
                                const formattedPhone = formatPhoneNumber(e.target.value, true);
                                handleChange('newPhone', formattedPhone);
                            }}
                            className="w-full px-3 py-2 border border-header-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+90 5XX XXX XX XX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className="w-full px-3 py-2 border border-header-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={closeModal} className="px-4 py-2 text-text-secondary hover:text-gray-800 font-medium" disabled={isUpdating}>
                        Cancel
                    </button>
                    <button onClick={submit} disabled={isUpdating} className="px-6 py-2 bg-btn-primary text-white rounded-md hover:bg-btn-primary-hover disabled:opacity-50 font-medium">
                        {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhoneUpdateModal;
