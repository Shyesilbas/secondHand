import { useTranslation } from "react-i18next";
import { FileText as DocumentTextIcon } from 'lucide-react';
import { AGREEMENT_TYPE_LABELS } from '../agreements.js';
const AgreementsSection = ({
  agreements,
  acceptedAgreements,
  onToggle,
  onRead,
  error
}) => {
  const {
    t
  } = useTranslation();
  if (!agreements?.length) return null;
  return <div className="space-y-4">
            <div>
                <h3 className="text-sm font-medium text-text-primary mb-1.5 tracking-tight">{t("agreements")}</h3>
                <p className="text-xs text-text-secondary tracking-tight">{t("you_must_accept_all_agreements_below_to_")}</p>
            </div>

            <div className="space-y-3">
                {agreements.map(agreement => <div key={agreement.agreementId} className="flex items-start gap-3 rounded-xl border border-border-light bg-background-primary px-3 py-3 transition-colors hover:border-primary">
                        <div className="pt-0.5">
                            <input type="checkbox" id={`agreement-${agreement.agreementId}`} checked={acceptedAgreements.has(agreement.agreementId)} onChange={() => onToggle(agreement.agreementId)} className="h-4 w-4 text-primary focus:ring-primary border-border-light rounded" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="h-4 w-4 text-text-muted shrink-0" />
                                <button type="button" onClick={() => onRead(agreement)} className="text-sm font-semibold text-text-primary hover:text-primary hover:underline cursor-pointer text-left tracking-tight transition-colors">
                                    {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
                                </button>
                            </div>
                        </div>
                    </div>)}
            </div>

            {error && <div className="p-3 bg-status-error-bg border border-status-error-border rounded-xl">
                    <p className="text-status-error text-xs tracking-tight">{error}</p>
                </div>}
        </div>;
};
export default AgreementsSection;