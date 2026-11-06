import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import AgreementsSection from '../../agreements/components/AgreementsSection.jsx';
import { AuthDivider, AuthField, AuthHeader, GoogleButton, PasswordField, PasswordRules } from './AuthPrimitives.jsx';
import GenderChoice from './GenderChoice.jsx';
import { validateAccountFields } from '../utils/registerValidator.js';

/**
 * Two steps: account (email, password) first, then who you are (name, phone, birth date, gender)
 * with the agreements. Google sign-up sits under step 1 only.
 */
export const RegisterForm = ({
  formData,
  errors: parentErrors,
  isLoading,
  genderOptions,
  gendersLoading,
  handleChange,
  onSubmit,
  agreements,
  agreementsLoading,
  acceptedAgreements,
  onToggleAgreement,
  onReadAgreement
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [accountErrors, setAccountErrors] = useState({});
  const errors = { ...parentErrors, ...accountErrors };

  const onFieldChange = (e) => {
    if (accountErrors[e.target.name]) setAccountErrors(prev => ({ ...prev, [e.target.name]: '' }));
    handleChange(e);
  };

  const goToDetails = (e) => {
    e.preventDefault();
    const next = validateAccountFields(formData);
    setAccountErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  };

  const submit = (e) => {
    e.preventDefault();
    const next = validateAccountFields(formData);
    if (Object.keys(next).length > 0) {
      setAccountErrors(next);
      setStep(1);
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="flex flex-col">
      <AuthHeader
        title={step === 1 ? t('auth_register_title', 'Hesap oluştur') : t('auth_register_details_title', 'Seni tanıyalım')}
        subtitle={step === 1
          ? t('auth_register_subtitle', 'E-posta adresin ve bir şifreyle başla.')
          : t('auth_register_details_subtitle', 'Siparişlerin ve kargo için gereken bilgiler.')}
      >
        <p className="mt-4 text-xs tabular-nums text-text-tertiary">
          {t('auth_register_step', { defaultValue: 'Adım {{step}}/2', step })}
        </p>
        <div className="mt-1.5 flex gap-1.5" aria-hidden>
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>
      </AuthHeader>

      {step === 1 ? (
        <form onSubmit={goToDetails} noValidate className="space-y-4">
          <AuthField
            label={t('auth_email', 'E-posta')}
            type="email"
            name="email"
            value={formData.email}
            onChange={onFieldChange}
            placeholder="ornek@eposta.com"
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
          <div>
            <PasswordField
              label={t('auth_password', 'Şifre')}
              name="password"
              value={formData.password}
              onChange={onFieldChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <div className="mt-2"><PasswordRules password={formData.password} /></div>
          </div>
          <PasswordField
            label={t('auth_password_repeat', 'Şifre tekrar')}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onFieldChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full">{t('continue', 'Devam et')}</Button>
        </form>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {errors.submit && <Alert type="error" message={errors.submit} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AuthField label={t('auth_name', 'Ad')} name="name" value={formData.name} onChange={onFieldChange} error={errors.name} autoComplete="given-name" autoFocus />
            <AuthField label={t('auth_surname', 'Soyad')} name="surname" value={formData.surname} onChange={onFieldChange} error={errors.surname} autoComplete="family-name" />
          </div>
          <AuthField
            label={t('auth_phone', 'Telefon')}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onFieldChange}
            placeholder="05XX XXX XX XX"
            error={errors.phone}
            autoComplete="tel"
          />
          <AuthField
            label={t('auth_birthdate', 'Doğum tarihi')}
            name="birthdate"
            value={formData.birthdate}
            onChange={onFieldChange}
            placeholder="GG/AA/YYYY"
            inputMode="numeric"
            error={errors.birthdate}
            autoComplete="bday"
          />
          <GenderChoice
            options={genderOptions}
            loading={gendersLoading}
            value={formData.gender}
            onChange={(value) => onFieldChange({ target: { name: 'gender', value } })}
            error={errors.gender}
          />

          <div className="border-t border-border-light pt-4">
            {agreementsLoading
              ? <Skeleton className="h-16 w-full" />
              : (
                <AgreementsSection
                  agreements={agreements}
                  acceptedAgreements={acceptedAgreements}
                  onToggle={onToggleAgreement}
                  onRead={onReadAgreement}
                  error={errors.agreements}
                />
              )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(1)} className="sm:w-auto">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('back', 'Geri')}
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {isLoading ? t('auth_creating_account', 'Hesap oluşturuluyor…') : t('auth_create_account', 'Hesabı oluştur')}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <>
          <AuthDivider />
          <GoogleButton />
        </>
      )}

      <p className="mt-8 text-center text-sm text-text-secondary">
        {t('auth_have_account', 'Zaten hesabın var mı?')}{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-text-primary hover:underline">{t('auth_login_link', 'Giriş yap')}</Link>
      </p>
    </div>
  );
};
