import React from 'react';
import {AlertTriangle} from 'lucide-react';

const ReservationModal = ({ isOpen, onClose, cartItem }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Low Stock Alert</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Limited stock available. This item is reserved for you for 15 minutes. Finish your checkout now to secure your order, or it will be released back to inventory.                        </p>
                        {cartItem?.listing?.title && (
                            <p className="mt-3 text-sm font-medium text-slate-800 truncate">{cartItem.listing.title}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export default ReservationModal;
