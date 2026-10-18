import { useTranslation } from "react-i18next";
import Modal from '../../common/components/ui/Modal.jsx';
import Button from '../../common/components/ui/Button.jsx';

const ClearCartModal = ({
 isOpen,
 onClose,
 onConfirm,
 isClearing = false
}) => {
 const {
 t
 } = useTranslation();
 return <Modal isOpen={isOpen} onClose={onClose} title={t("clear_cart")} size="sm" footer={<>
 <Button variant="secondary" onClick={onClose} disabled={isClearing}>{t("cancel")}</Button>
 <Button variant="danger" onClick={onConfirm} disabled={isClearing}>{isClearing ? t("clearing") : t("clear_cart")}</Button>
 </>}>
 <p className="text-sm text-text-secondary">{t("are_you_sure_you_want_to_remove_all_item")}</p>
 </Modal>;
};
export default ClearCartModal;
