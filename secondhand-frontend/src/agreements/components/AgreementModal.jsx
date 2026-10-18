import { useTranslation } from "react-i18next";
import { AGREEMENT_TYPE_LABELS } from '../agreements.js';
import { formatDate } from '../../common/formatters.js';
import { Clock as ClockIcon } from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';
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
 if (!agreement) return null;
 return <Modal isOpen={open} onClose={onClose} title={AGREEMENT_TYPE_LABELS[agreement.agreementType]} size="xl" footer={<>
 <p className="mr-auto self-center text-xs text-text-tertiary">{t("please_read_carefully_before_accepting")}</p>
 <Button variant="secondary" onClick={onClose}>{t("close")}</Button>
 <Button onClick={() => onAccept?.(agreement)} disabled={!!accepting}>{accepting ? t("accepting") : t("i_accept")}</Button>
 </>}>
 <p className="mb-4 inline-flex items-center gap-1.5 text-xs tabular-nums text-text-tertiary">
 <ClockIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("updated")}{formatDate(agreement.updatedDate || agreement.createdDate)}
 <span aria-hidden>·</span>{t("not_legally_binding_document")}
 </p>
 <div className="prose prose-sm max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-p:leading-relaxed">
 <div dangerouslySetInnerHTML={{
 __html: agreement.content
 }} />
 </div>
 </Modal>;
};
export default AgreementModal;
