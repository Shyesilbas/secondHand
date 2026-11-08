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

 <div className="space-y-2">
 {agreements.map(agreement => {
 const isChecked = acceptedAgreements.has(agreement.agreementId);
 return (
 <div
 key={agreement.agreementId}
 className={`flex items-center justify-between gap-3 rounded border px-3 py-2.5 transition-colors duration-150 ${
 isChecked
 ? 'border-border bg-background-secondary/70'
 : 'border-border-light bg-background-primary hover:border-card-border-hover'
 }`}
 >
 <div className="flex min-w-0 items-center gap-2.5">
 <input
 type="checkbox"
 id={`agreement-${agreement.agreementId}`}
 checked={isChecked}
 onChange={() => onToggle(agreement.agreementId)}
 className="h-4 w-4 shrink-0 cursor-pointer rounded-sm border-border text-primary accent-primary focus:ring-primary"
 />
 <button
 type="button"
 onClick={() => onRead(agreement)}
 className="truncate text-left text-xs font-medium text-text-primary underline transition-colors hover:text-primary"
 >
 {AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType}
 </button>
 </div>
 <button
 type="button"
 onClick={() => onRead(agreement)}
 className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
 >
 <DocumentTextIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
 <span>{t("read", "Oku")}</span>
 </button>
 </div>
 );
 })}
 </div>

 {error && <div className="p-3 bg-background-secondary border border-border rounded">
 <p className="text-status-error text-xs tracking-tight">{error}</p>
 </div>}
 </div>;
};
export default AgreementsSection;