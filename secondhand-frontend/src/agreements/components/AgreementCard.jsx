import {Check as CheckIcon, Clock as ClockIcon, FileText, ExternalLink, Calendar} from 'lucide-react';
import {AGREEMENT_TYPE_LABELS} from '../agreements.js';
import {formatDate} from '../../common/formatters.js';

const AgreementCard = ({agreement, status = {}, onAccept, accepting, onRead}) => {
  const StatusIcon = status.icon || ClockIcon;
  const isPending = status.status === 'pending' || status.status === 'outdated';
  const isAccepted = status.status === 'accepted';

  return (
    <div className={`rounded-xl border transition-all duration-200 hover:shadow-sm ${
      isPending ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: icon + info */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPending ? 'bg-amber-100' : 'bg-gray-100'
            }`}>
              <FileText className={`w-5 h-5 ${isPending ? 'text-amber-600' : 'text-gray-500'}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">
                {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <span className="tabular-nums">v{agreement.version}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(agreement.updatedDate)}
                </span>
              </div>
              {status.acceptedDate && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                  Accepted on {formatDate(status.acceptedDate)}
                </p>
              )}
            </div>
          </div>

          {/* Right: status badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 border ${status.bgColor} ${status.borderColor} ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.text}
          </div>
        </div>

        {/* Action row */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onRead(agreement)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >
            <ExternalLink className="w-3 h-3" />
            Read Agreement
          </button>

          {isPending && (
            <button
              disabled={accepting}
              onClick={() => onAccept(agreement)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  Accept
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgreementCard;
