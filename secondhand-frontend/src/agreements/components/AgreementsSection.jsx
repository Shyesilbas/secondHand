import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements.js';

const AgreementsSection = ({ agreements, acceptedAgreements, onToggle, onRead, error }) => {
    if (!agreements?.length) return null;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Agreements</h3>
                <p className="text-sm text-gray-600 mb-4">
                    You must agree to the following terms and conditions to register.
                </p>
            </div>

            <div className="space-y-3">
                {agreements.map((agreement) => (
                    <div key={agreement.agreementId} className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id={`agreement-${agreement.agreementId}`}
                            checked={acceptedAgreements.has(agreement.agreementId)}
                            onChange={() => onToggle(agreement.agreementId)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                <button
                                    type="button"
                                    onClick={() => onRead(agreement)}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                >
                                    {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default AgreementsSection;

