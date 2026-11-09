import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuth } from '../AuthContext.jsx';
import { authService } from '../services/authService.js';
import { useGenderEnum } from '../../common/hooks/useGenderEnum.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { AuthBrand, AuthField, AuthHeader } from '../components/AuthPrimitives.jsx';
import GenderChoice from '../components/GenderChoice.jsx';
import { validateBirthdate, validatePhone } from '../utils/registerValidator.js';
import { formatBirthdateInput } from '../../common/utils/dateFormat.js';
import { formatPhoneNumber } from '../../common/utils/phoneFormatter.js';
import { useRegisterAgreements } from '../../agreements/hooks/useRegisterAgreements.js';
import AgreementsSection from '../../agreements/components/AgreementsSection.jsx';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';

// The backend puts the token in the URL fragment so it never reaches server logs or Referer headers.
const readRegistrationTokenFromHash = () => {
 const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
 return new URLSearchParams(hash).get('registrationToken') || '';
};
const OAuthCompletePage = () => {
 const {
 t
 } = useTranslation();
 const navigate = useNavigate();
 const {
 login
 } = useAuth();
 const {
 genders,
 isLoading: gendersLoading
 } = useGenderEnum();
 const [form, setForm] = useState({
 phone: '',
 gender: '',
 birthdate: ''
 });
 const [submitting, setSubmitting] = useState(false);
 const [errors, setErrors] = useState({});
 const [registrationToken] = useState(readRegistrationTokenFromHash);
 const {
 agreements,
 agreementsLoading,
 acceptedAgreements,
 selectedAgreement,
 showAgreementModal,
 handleAgreementToggle,
 handleAgreementClick,
 handleCloseModal,
 handleAcceptFromModal
 } = useRegisterAgreements();

 useEffect(() => {
 if (window.location.hash) {
 window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
 }
 }, []);

 const tokenClaims = useMemo(() => {
 if (!registrationToken) return {};
 try {
 const base64Url = registrationToken.split('.')[1];
 if (!base64Url) return {};
 const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
 const jsonPayload = decodeURIComponent(
 atob(base64)
 .split('')
 .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
 .join('')
 );
 return JSON.parse(jsonPayload);
 } catch {
 return {};
 }
 }, [registrationToken]);

 const baseInfo = useMemo(() => ({
 registrationToken,
 email: tokenClaims.email || '',
 name: tokenClaims.name || '',
 surname: tokenClaims.surname || '',
 picture: tokenClaims.picture || ''
 }), [registrationToken, tokenClaims]);
 const initials = [baseInfo.name?.[0], baseInfo.surname?.[0]].filter(Boolean).join('').toUpperCase();
 const handleChange = e => {
 const {
 name,
 value
 } = e.target;
 let formattedValue = value;
 if (name === 'birthdate') {
 formattedValue = formatBirthdateInput(value, form.birthdate);
 } else if (name === 'phone') {
 formattedValue = formatPhoneNumber(value, true);
 }
 setForm(prev => ({
 ...prev,
 [name]: formattedValue
 }));
 if (errors[name]) setErrors(prev => ({
 ...prev,
 [name]: ''
 }));
 };
 const validate = () => {
 const next = {};
 const phoneError = validatePhone(form.phone);
 if (phoneError) next.phone = phoneError;
 if (!form.gender) next.gender = t('select_gender', 'Cinsiyet seç.');
 const birthdateError = validateBirthdate(form.birthdate);
 if (birthdateError) next.birthdate = birthdateError;
 if (agreementsLoading || agreements.some(a => !acceptedAgreements.has(a.agreementId))) {
 next.agreements = t('agreements_required', 'Devam etmek için sözleşmeleri onaylaman gerekiyor.');
 }
 setErrors(next);
 return Object.keys(next).length === 0;
 };
 const handleSubmit = async e => {
 e.preventDefault();
 if (!validate()) return;
 if (!baseInfo.registrationToken) {
 setErrors({
 submit: t('google_session_not_found', 'Google oturumu bulunamadı. Lütfen Google ile yeniden giriş yap.')
 });
 return;
 }
 if (!baseInfo.email) {
 setErrors({
 submit: t('google_email_missing', 'Google hesabından e-posta adresi alınamadı.')
 });
 return;
 }
 setSubmitting(true);
 try {
 const payload = {
 registrationToken: baseInfo.registrationToken,
 name: baseInfo.name,
 surname: baseInfo.surname,
 email: baseInfo.email,
 phoneNumber: form.phone,
 gender: form.gender,
 birthdate: form.birthdate,
 acceptedAgreementIds: Array.from(acceptedAgreements)
 };
 const loginResponse = await authService.completeOAuth(payload);
 await login(loginResponse);
 navigate(ROUTES.DASHBOARD, {
 replace: true
 });
 } catch (err) {
 setErrors({
 submit: err.response?.data?.message || t('registration_failed_retry', 'Kayıt tamamlanamadı. Lütfen tekrar dene.')
 });
 } finally {
 setSubmitting(false);
 }
 };
 const fullName = [baseInfo.name, baseInfo.surname].filter(Boolean).join(' ');
 return <div className="flex flex-col">
 <AuthBrand />
 <AuthHeader title={t('auth_oauth_complete_title', 'Kaydını tamamla')} subtitle={t('auth_oauth_complete_subtitle', 'Siparişlerin ve kargo için birkaç bilgi daha gerekiyor.')} />

 <div className="mb-6 flex items-center gap-3 rounded border border-border-light bg-background-secondary p-3">
 {baseInfo.picture
 ? <img src={baseInfo.picture} alt="" referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-full object-cover" />
 : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-sm font-medium text-text-secondary">{initials || '?'}</span>}
 <div className="min-w-0">
 <p className="truncate text-sm font-medium text-text-primary">{fullName || '—'}</p>
 <p className="truncate text-xs text-text-tertiary">{baseInfo.email || '—'}</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} noValidate className="space-y-4">
 {errors.submit && <Alert type="error" message={errors.submit} />}

 <AuthField label={t('auth_phone', 'Telefon')} type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="05XX XXX XX XX" error={errors.phone} autoComplete="tel" autoFocus />
 <AuthField label={t('auth_birthdate', 'Doğum tarihi')} name="birthdate" value={form.birthdate} onChange={handleChange} placeholder="GG/AA/YYYY" inputMode="numeric" error={errors.birthdate} autoComplete="bday" />
 <GenderChoice options={genders} loading={gendersLoading} value={form.gender} onChange={value => handleChange({ target: { name: 'gender', value } })} error={errors.gender} />

 <div className="border-t border-border-light pt-4">
 {agreementsLoading ? <Skeleton className="h-16 w-full" /> : <AgreementsSection agreements={agreements} acceptedAgreements={acceptedAgreements} onToggle={id => {
 handleAgreementToggle(id);
 if (errors.agreements) setErrors(prev => ({
 ...prev,
 agreements: ''
 }));
 }} onRead={handleAgreementClick} error={errors.agreements} />}
 </div>

 <Button type="submit" className="w-full" disabled={submitting}>
 {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
 {submitting ? t('auth_saving', 'Kaydediliyor…') : t('auth_oauth_complete_submit', 'Kaydı tamamla')}
 </Button>
 </form>

 <AgreementModal
 agreement={selectedAgreement}
 open={showAgreementModal}
 onClose={handleCloseModal}
 onAccept={agreement => {
 handleAcceptFromModal(agreement);
 if (errors.agreements) setErrors(prev => ({
 ...prev,
 agreements: ''
 }));
 }}
 isAccepted={Boolean(selectedAgreement && acceptedAgreements.has(selectedAgreement.agreementId))}
 />
 </div>;
};
export default OAuthCompletePage;
