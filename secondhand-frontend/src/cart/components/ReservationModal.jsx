import { useTranslation } from "react-i18next";
import { Button, Modal } from '../../common/components/ui/index.js';
const ReservationModal = ({
 isOpen,
 onClose,
 cartItem
}) => {
 const {
 t
 } = useTranslation();
 return <Modal isOpen={isOpen} onClose={onClose} title={t("low_stock_alert")} size="sm" footer={<Button onClick={onClose}>{t("got_it")}</Button>}>
 <p className="text-sm leading-relaxed text-text-secondary">{t("limited_stock_available_this_item_is_res")}</p>
 {cartItem?.listing?.title && <p className="mt-3 truncate text-sm font-medium text-text-primary">{cartItem.listing.title}</p>}
 </Modal>;
};
export default ReservationModal;
