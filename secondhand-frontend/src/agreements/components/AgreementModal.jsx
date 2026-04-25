import {AGREEMENT_TYPE_LABELS} from '../agreements.js';
import {formatDate} from '../../common/formatters.js';
import {
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  FileText as DocumentTextIcon,
  ShieldCheck as ShieldCheckIcon,
  X as XMarkIcon,
  Check as CheckIcon,
} from 'lucide-react';

const AgreementModal = ({agreement, open, onClose, onAccept, accepting}) => {
  if (!open || !agreement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Legal Agreement Document</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center transition-all duration-200"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Meta bar */}
        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
            Updated: {formatDate(agreement.updatedDate || agreement.createdDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
            Not Legally Binding Document
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <div className="prose prose-sm prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
              <div dangerouslySetInnerHTML={{__html: agreement.content}} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Please read carefully before accepting</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onAccept?.(agreement)}
              disabled={!!accepting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  I Accept
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;
