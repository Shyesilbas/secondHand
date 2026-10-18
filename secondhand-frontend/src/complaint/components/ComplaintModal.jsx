import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { COMPLAINT_REASONS } from '../types/complaintTypes.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { Button, Modal } from '../../common/components/ui/index.js';
import logger from '../../common/utils/logger.js';
import { COMPLAINT_DEFAULTS, COMPLAINT_MESSAGES } from '../complaintConstants.js';
const FIELD = 'w-full rounded border bg-background-primary px-3 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus';
const ComplaintModal = ({
 isOpen,
 onClose,
 onSubmit,
 targetUserName,
 targetUserId,
 listingId,
 listingTitle,
 isLoading
}) => {
 const {
 t
 } = useTranslation();
 const [formData, setFormData] = useState({
 reason: '',
 description: ''
 });
 const [errors, setErrors] = useState({});
 useEffect(() => {
 if (isOpen) {
 setFormData({
 reason: '',
 description: ''
 });
 setErrors({});
 }
 }, [isOpen]);
 const validateForm = () => {
 const newErrors = {};
 if (!formData.reason.trim()) {
 newErrors.reason = COMPLAINT_MESSAGES.REASON_REQUIRED;
 }
 if (!formData.description.trim()) {
 newErrors.description = COMPLAINT_MESSAGES.DESCRIPTION_REQUIRED;
 } else if (formData.description.trim().length < COMPLAINT_DEFAULTS.MIN_DESCRIPTION_LENGTH) {
 newErrors.description = COMPLAINT_MESSAGES.DESCRIPTION_TOO_SHORT;
 }
 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };
 const {
 user: currentUser
 } = useAuthState();
 const handleSubmit = async e => {
 e.preventDefault();
 if (!currentUser) {
 logger.error('User must be logged in to submit a complaint.');
 return;
 }
 if (!validateForm()) return;
 const complaintData = {
 complainerId: currentUser.id,
 complainedUserId: targetUserId,
 listingId,
 reason: formData.reason,
 description: formData.description.trim()
 };
 try {
 await onSubmit(complaintData);
 onClose();
 } catch (error) {
 // useComplaints already shows the error toast; keep the form open so the user can retry.
 logger.error('Complaint submission failed:', error);
 }
 };
 const handleInputChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }));
 if (errors[field]) {
 setErrors(prev => ({
 ...prev,
 [field]: undefined
 }));
 }
 };
 return <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={listingId ? 'Report listing' : 'Report user'} size="sm" footer={<>
 <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t("cancel")}</Button>
 <Button type="submit" form="complaint-form" disabled={isLoading || !formData.reason || !formData.description.trim()}>
 {isLoading ? t("submitting") : t("submit_complaint")}
 </Button>
 </>}>
 <p className="mb-4 text-sm text-text-secondary">
 {t("you_are_reporting")}<span className="font-medium text-text-primary">{listingId && listingTitle ? listingTitle : targetUserName}</span>
 </p>
 <form id="complaint-form" onSubmit={handleSubmit} noValidate className="space-y-4">
 <div>
 <label htmlFor="complaint-reason" className="mb-1 block text-sm font-medium text-text-primary">{t("reason")}</label>
 <select id="complaint-reason" value={formData.reason} onChange={e => handleInputChange('reason', e.target.value)} aria-invalid={Boolean(errors.reason)} className={`h-10 ${FIELD} ${errors.reason ? 'border-status-error' : 'border-border'}`} disabled={isLoading}>
 <option value="">{t("select_a_reason")}</option>
 {COMPLAINT_REASONS.map(reason => <option key={reason.value} value={reason.value}>
 {reason.label}
 </option>)}
 </select>
 {errors.reason && <p className="mt-1 text-xs text-status-error-text">{errors.reason}</p>}
 </div>

 <div>
 <label htmlFor="complaint-description" className="mb-1 block text-sm font-medium text-text-primary">{t("detailed_description")}</label>
 <textarea id="complaint-description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={5} aria-invalid={Boolean(errors.description)} className={`resize-none py-2 ${FIELD} ${errors.description ? 'border-status-error' : 'border-border'}`} placeholder={t("please_explain_your_complaint_in_detail")} disabled={isLoading} maxLength={COMPLAINT_DEFAULTS.MAX_DESCRIPTION_LENGTH} />
 <div className="mt-1 flex items-start justify-between gap-3 text-xs">
 {errors.description ? <p className="text-status-error-text">{errors.description}</p> : <p className="text-text-tertiary">{t("a_detailed_explanation_helps_us_resolve_")}</p>}
 <p className="shrink-0 tabular-nums text-text-tertiary">
 {formData.description.length}/{COMPLAINT_DEFAULTS.MAX_DESCRIPTION_LENGTH}
 </p>
 </div>
 </div>

 <div className="border-t border-border-light pt-4">
 <h4 className="text-sm font-medium text-text-primary">{t("how_does_the_complaint_process_work")}</h4>
 <p className="mt-1 text-sm text-text-secondary">{t("we_will_review_your_complaint_and_get_ba")}</p>
 </div>
 </form>
 </Modal>;
};
export default ComplaintModal;
