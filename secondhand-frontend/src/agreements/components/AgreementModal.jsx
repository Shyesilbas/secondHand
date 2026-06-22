import { useTranslation } from "react-i18next";
import { AGREEMENT_TYPE_LABELS } from '../agreements.js';
import { formatDate } from '../../common/formatters.js';
import { CheckCircle as CheckCircleIcon, Clock as ClockIcon, FileText as DocumentTextIcon, ShieldCheck as ShieldCheckIcon, X as XMarkIcon, Check as CheckIcon } from 'lucide-react';
const AgreementModal = ({
  agreement,
  open,
  onClose,
  onAccept,
  accepting
}) => {
  const {
    t
  } = useTranslation();
  if (!open || !agreement) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-background-primary rounded-xl shadow-lg border border-border-light overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-border-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">{t("legal_agreement_document")}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors" aria-label={t("kapat")}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Meta bar */}
        <div className="px-6 py-3 bg-background-secondary border-b border-border-light flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-muted shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-text-muted" />{t("updated")}{formatDate(agreement.updatedDate || agreement.createdDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-status-success" />{t("not_legally_binding_document")}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <div className="prose prose-sm prose-gray max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-p:leading-relaxed">
              <div dangerouslySetInnerHTML={{
              __html: agreement.content
            }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light bg-background-secondary/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <CheckCircleIcon className="w-3.5 h-3.5 text-status-success" />
            <span>{t("please_read_carefully_before_accepting")}</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-xl transition-all duration-200">{t("close")}</button>
            <button type="button" onClick={() => onAccept?.(agreement)} disabled={!!accepting} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {accepting ? <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("accepting")}</> : <>
                  <CheckIcon className="w-3.5 h-3.5" />{t("i_accept")}</>}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default AgreementModal;