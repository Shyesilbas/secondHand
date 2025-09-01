import React from 'react';
import { CheckIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements.js';
import { formatDate } from '../../utils/formatters.js';

const AgreementCard = ({ agreement, status = {}, onAccept, accepting, onRead }) => {
  const StatusIcon = status.icon || ClockIcon;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
            </h3>
            <p className="text-sm text-gray-500">
              Version: {agreement.version} | Updated: {formatDate(agreement.updatedDate)}
            </p>
          </div>
        </div>
        {status.bgColor && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.bgColor} ${status.borderColor} border`}>
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onRead(agreement)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Read Agreement
        </button>
      </div>

      {status.status === 'pending' && (
        <div className="flex justify-end">
          <button
            disabled={accepting}
            onClick={() => onAccept(agreement)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepting ? 'Accepting...' : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Accept
              </>
            )}
          </button>
        </div>
      )}

      {status.acceptedDate && (
        <p className="text-green-700 text-sm mt-2">
          Accepted on: {formatDate(status.acceptedDate)}
        </p>
      )}
    </div>
  );
};

export default AgreementCard;
