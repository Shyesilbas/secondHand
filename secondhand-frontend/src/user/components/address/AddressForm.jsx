import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Button, Modal } from '../../../common/components/ui/index.js';
import { USER_ADDRESS_TYPES } from '../../userConstants.js';
import LocationFields from '../../../common/components/forms/LocationFields.jsx';
const defaultAddress = {
 addressLine: '',
 city: '',
 cityKey: '',
 district: '',
 districtKey: '',
 neighborhoodKey: '',
 state: '',
 postalCode: '',
 country: '',
 addressType: USER_ADDRESS_TYPES.HOME,
 mainAddress: false
};
const inputClass = 'h-10 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus';
const AddressForm = ({
 isOpen,
 onClose,
 onSubmit,
 initialData = null,
 isEditing = false,
 loading = false,
 error = null
}) => {
 const {
 t
 } = useTranslation();
 const [formData, setFormData] = useState(defaultAddress);
 useEffect(() => {
 if (isEditing && initialData) {
 setFormData(initialData);
 } else {
 setFormData(defaultAddress);
 }
 }, [isEditing, initialData, isOpen]);
 const handleSubmit = async e => {
 e.preventDefault();
 await onSubmit(formData);
 };
 const handleInputChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }));
 };
 const handleInputChangeEvent = e => {
 const {
 name,
 value
 } = e.target;
 setFormData(prev => {
 const next = {
 ...prev,
 [name]: value
 };
 if (name === 'district') {
 next.state = value;
 }
 return next;
 });
 };
 return <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Update address' : 'Add new address'} description={t("delivery_and_billing_details")} size="md" footer={<>
 <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
 <Button type="submit" form="address-form" disabled={loading}>
 {loading ? isEditing ? 'Updating…' : 'Saving…' : isEditing ? 'Save changes' : 'Save address'}
 </Button>
 </>}>
 <form id="address-form" className="space-y-5" onSubmit={handleSubmit}>
 <div>
 <label htmlFor="address-line" className="mb-1 block text-sm font-medium text-text-primary">{t("address_line")}</label>
 <input id="address-line" className={inputClass} placeholder={t("street_building_apartment")} value={formData.addressLine} onChange={e => handleInputChange('addressLine', e.target.value)} required autoFocus />
 </div>

 <div className="mb-5">
 <LocationFields formData={formData} errors={{}} onInputChange={handleInputChangeEvent} />
 </div>

 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
 <div>
 <label htmlFor="address-postal" className="mb-1 block text-sm font-medium text-text-primary">{t("postal_code")}</label>
 <input id="address-postal" className={inputClass} placeholder={t("postal_code")} value={formData.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} required />
 </div>
 <div>
 <label htmlFor="address-country" className="mb-1 block text-sm font-medium text-text-primary">{t("country")}</label>
 <input id="address-country" className={inputClass} placeholder={t("country")} value={formData.country} onChange={e => handleInputChange('country', e.target.value)} required />
 </div>
 </div>

 <div>
 <label htmlFor="address-type" className="mb-1 block text-sm font-medium text-text-primary">{t("address_type")}</label>
 <select id="address-type" className={`${inputClass} cursor-pointer`} value={formData.addressType} onChange={e => handleInputChange('addressType', e.target.value)}>
 <option value={USER_ADDRESS_TYPES.HOME}>{t("home")}</option>
 <option value={USER_ADDRESS_TYPES.WORK}>{t("work")}</option>
 <option value={USER_ADDRESS_TYPES.OTHER}>{t("other")}</option>
 </select>
 </div>

 <label className="flex cursor-pointer items-start gap-3">
 <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-border text-primary accent-primary focus:ring-border-focus" checked={formData.mainAddress} onChange={e => handleInputChange('mainAddress', e.target.checked)} />
 <span className="text-sm leading-snug text-text-secondary">
 <span className="font-medium text-text-primary">{t("main_address")}</span>
 <span className="mt-0.5 block text-text-tertiary">{t("use_as_default_for_checkout_and_delivery")}</span>
 </span>
 </label>

 {error && <p role="alert" className="text-sm text-status-error-text">{error}</p>}
 </form>
 </Modal>;
};
export default AddressForm;