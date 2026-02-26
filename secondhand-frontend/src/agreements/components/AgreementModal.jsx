import {AGREEMENT_TYPE_LABELS} from '../agreements.js';
import {formatDate} from '../../common/formatters.js';
import {
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  FileText as DocumentTextIcon,
  ShieldCheck as ShieldCheckIcon,
  X as XMarkIcon
} from 'lucide-react';

const AgreementModal = ({ agreement, open, onClose, onAccept, accepting }) => {
  if (!open || !agreement) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
              </h3>
              <p className="text-sm text-gray-200">
                Legal Agreement Document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-white bg-opacity-10 rounded-lg flex items-center justify-center text-white hover:bg-opacity-20 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Agreement Info */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span>Last Updated: {formatDate(agreement.updatedDate || agreement.createdDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                  <span>Not Legally Binding Document</span>
                </div>
              </div>
            </div>

            {/* Agreement Content */}
            <div className="prose prose-gray max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: agreement.content }} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span>Please read this agreement carefully</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onAccept?.(agreement)}
              disabled={!!accepting}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {accepting ? 'Accepting...' : 'I Understand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;



