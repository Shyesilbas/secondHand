import { useTranslation } from 'react-i18next';
import Skeleton from '../../common/components/ui/Skeleton.jsx';

/** Gender as a row of radio buttons (register and the Google sign-up completion). */
const GenderChoice = ({ options = [], loading = false, value, onChange, error }) => {
  const { t } = useTranslation();

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-text-primary">{t('auth_gender', 'Cinsiyet')}</legend>
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <div className="flex gap-2" role="radiogroup">
          {options.map(option => {
            const selected = value === option.value;
            return (
              <label
                key={option.value}
                className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded border px-3 text-sm transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border-focus ${
                  selected
                    ? 'border-border-dark bg-background-secondary font-medium text-text-primary'
                    : error ? 'border-status-error text-text-secondary hover:text-text-primary' : 'border-border text-text-secondary hover:border-card-border-hover hover:text-text-primary'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-status-error-text">{error}</p>}
    </fieldset>
  );
};

export default GenderChoice;
