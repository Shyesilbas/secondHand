import React from 'react';
import { AGREEMENT_TYPE_LABELS } from '../agreements.js';

const AgreementModal = ({ agreement, open, onClose }) => {
  if (!open || !agreement) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <h3 className="text-lg font-semibold text-text-primary">
            {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: agreement.content }} />
          </div>
        </div>
        <div className="flex justify-end p-6 border-t border-sidebar-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;



