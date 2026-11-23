import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { useColorScheme } from '../../../hooks/useColorScheme.js';
import { headerIconTriggerClass } from './HeaderIconButton.jsx';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { isDark, toggleColorScheme } = useColorScheme();
  const label = isDark
    ? t('switch_to_light_mode', 'Açık temaya geç')
    : t('switch_to_dark_mode', 'Koyu temaya geç');

  return (
    <button
      type="button"
      onClick={toggleColorScheme}
      aria-label={label}
      title={label}
      className={headerIconTriggerClass(false)}
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
};

export default ThemeToggle;
