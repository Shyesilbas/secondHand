import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../../common/components/ui/index.js';

const ShowcaseSuccessModal = ({ isOpen, onClose, listingTitle, days, pricePaid }) => {
 const { t } = useTranslation();

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={t("showcase_success_title")} size="sm" footer={<Button onClick={onClose}>{t("close")}</Button>}>
 <p className="text-sm text-text-secondary">
 {listingTitle ? `"${listingTitle}" ` : ''}{t("showcase_success_desc")}
 </p>
 {(days || pricePaid) && (
 <dl className="mt-4 space-y-2 border-t border-border-light pt-4 text-sm">
 {days && (
 <div className="flex justify-between">
 <dt className="text-text-secondary">Süre</dt>
 <dd className="tabular-nums text-text-primary">{days} Gün</dd>
 </div>
 )}
 {pricePaid && (
 <div className="flex justify-between">
 <dt className="text-text-secondary">Ödenen tutar</dt>
 <dd className="tabular-nums text-text-primary">₺{pricePaid}</dd>
 </div>
 )}
 </dl>
 )}
 </Modal>
 );
};

export default ShowcaseSuccessModal;
