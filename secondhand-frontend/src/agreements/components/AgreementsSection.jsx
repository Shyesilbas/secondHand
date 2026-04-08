import {FileText as DocumentTextIcon} from 'lucide-react';
import {AGREEMENT_TYPE_LABELS} from '../agreements.js';

const AgreementsSection = ({ agreements, acceptedAgreements, onToggle, onRead, error }) => {
    if (!agreements?.length) return null;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">Agreements</h3>
                <p className="text-xs text-slate-600 tracking-tight">
                    You must accept all agreements below to complete registration.
                </p>
            </div>

            <div className="space-y-3">
                {agreements.map((agreement) => (
                    <div
                        key={agreement.agreementId}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-indigo-200"
                    >
                        <div className="pt-0.5">
                            <input
                                type="checkbox"
                                id={`agreement-${agreement.agreementId}`}
                                checked={acceptedAgreements.has(agreement.agreementId)}
                                onChange={() => onToggle(agreement.agreementId)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                <button
                                    type="button"
                                    onClick={() => onRead(agreement)}
                                    className="text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer text-left tracking-tight transition-colors"
                                >
                                    {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-xs tracking-tight">{error}</p>
                </div>
            )}
        </div>
    );
};

export default AgreementsSection;

