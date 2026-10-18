import { useTranslation } from "react-i18next";
import { formatPhoneNumber } from '../../utils/phoneFormatter.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
const INPUT = 'h-10 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus';
const PhoneUpdateModal = ({
 isOpen,
 formData,
 handleChange,
 submit,
 closeModal,
 isUpdating
}) => {
 const {
 t
 } = useTranslation();
 const handleSubmit = e => {
 e.preventDefault();
 submit();
 };
 return <Modal isOpen={isOpen} onClose={closeModal} title={t("update_phone_number")} size="sm" footer={<>
 <Button variant="secondary" onClick={closeModal} disabled={isUpdating}>{t("cancel")}</Button>
 <Button type="submit" form="phone-update-form" disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update phone number'}</Button>
 </>}>
 <form id="phone-update-form" onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="phone-update-new" className="mb-1 block text-sm font-medium text-text-primary">{t("new_phone_number")}</label>
 <input id="phone-update-new" type="tel" autoComplete="tel" value={formData.newPhone} onChange={e => handleChange('newPhone', formatPhoneNumber(e.target.value, true))} className={INPUT} placeholder={t("90_5xx_xxx_xx_xx")} />
 </div>
 <div>
 <label htmlFor="phone-update-password" className="mb-1 block text-sm font-medium text-text-primary">{t("password")}</label>
 <input id="phone-update-password" type="password" autoComplete="current-password" value={formData.password} onChange={e => handleChange('password', e.target.value)} className={INPUT} placeholder={t("enter_your_password")} />
 </div>
 </form>
 </Modal>;
};
export default PhoneUpdateModal;
