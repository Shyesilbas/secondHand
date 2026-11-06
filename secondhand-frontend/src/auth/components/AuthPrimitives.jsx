import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { API_BASE_URL } from '../../common/constants/apiEndpoints.js';
import { inputError, inputNormal } from '../../common/components/forms/inputStyles.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { PASSWORD_RULES } from '../utils/passwordRules.js';

/** Wordmark linking home; the one brand mark on every auth screen. */
export const AuthBrand = () => {
  const { t } = useTranslation();
  return (
    <Link to={ROUTES.HOME} className="mb-10 inline-flex items-center gap-2 self-start">
      <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-semibold text-white" aria-hidden>S</span>
      <span className="text-sm font-semibold tracking-tight text-text-primary">{t('secondhand', 'SecondHand')}</span>
    </Link>
  );
};

export const AuthHeader = ({ title, subtitle, children }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
    {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
    {children}
  </div>
);

/** Labelled input on the shared field styles; the error turns the border red and sits under the field. */
export const AuthField = ({ label, name, error, hint, rightElement, className = '', ...inputProps }) => {
  const autoId = useId();
  const id = inputProps.id || `${name || 'field'}-${autoId}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>}
      <div className="relative">
        <input
          id={id}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${error ? inputError : inputNormal} h-10 ${rightElement ? 'pr-10' : ''}`}
          {...inputProps}
        />
        {rightElement && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightElement}</div>}
      </div>
      {error
        ? <p id={`${id}-error`} className="mt-1.5 text-xs text-status-error-text">{error}</p>
        : hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-text-tertiary">{hint}</p>}
    </div>
  );
};

export const PasswordField = (props) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <AuthField
      {...props}
      type={visible ? 'text' : 'password'}
      rightElement={(
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? t('auth_hide_password', 'Şifreyi gizle') : t('auth_show_password', 'Şifreyi göster')}
          className="rounded p-1.5 text-text-tertiary transition-colors duration-150 hover:text-text-primary"
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </button>
      )}
    />
  );
};

/** Live checklist of the password rules the backend enforces. */
export const PasswordRules = ({ password = '' }) => (
  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2" aria-label="Şifre kuralları">
    {PASSWORD_RULES.map(rule => {
      const ok = rule.test(password);
      return (
        <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-status-success-text' : 'text-text-tertiary'}`}>
          {ok
            ? <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            : <span className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-border-dark" aria-hidden />}
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export const AuthDivider = () => {
  const { t } = useTranslation();
  return (
    <div className="my-6 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-border-light" />
      <span className="text-xs text-text-tertiary">{t('auth_or', 'veya')}</span>
      <span className="h-px flex-1 bg-border-light" />
    </div>
  );
};

/** Starts the backend Google OAuth flow. The logo keeps Google's brand colours, as their guidelines require. */
export const GoogleButton = () => {
  const { t } = useTranslation();
  return (
    <a href={`${API_BASE_URL}/v1/auth/oauth2/google`} className={`${buttonClasses('secondary')} w-full`}>
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 533.5 544.3" aria-hidden>
        <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4" />
        <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853" />
        <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05" />
        <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335" />
      </svg>
      {t('auth_continue_with_google', 'Google ile devam et')}
    </a>
  );
};

/** Centered card for auth screens that live inside the main layout (verify account, change password). */
export const AuthCard = ({ children }) => (
  <div className="flex items-start justify-center bg-background-secondary px-4 py-12 sm:py-16">
    <div className="w-full max-w-md rounded border border-border bg-background-primary p-6 sm:p-8">{children}</div>
  </div>
);
