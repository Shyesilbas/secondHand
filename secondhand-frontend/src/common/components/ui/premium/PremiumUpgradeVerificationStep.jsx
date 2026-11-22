import { useTranslation } from 'react-i18next';
import OtpDigitInputGroup from '../../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { OTP_CODE_LENGTH } from '../../../constants/otp.js';
import { formatCurrency } from '../../../formatters.js';
import Card from '../Card.jsx';

const PremiumUpgradeVerificationStep = ({
  otpTtlActive,
  otpTtlExpired,
  otpTtlFormatted,
  walletBalance,
  premiumPrice,
  suggestedFromInbox,
  suggestedEmail,
  verificationCode,
  onChangeCode,
  loading
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-text-primary">{t('email_verification')}</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {t(
            'enter_verification_code_sent_to_email',
            'E-postanıza gönderilen {{length}} haneli kodu girerek ödemeyi tamamlayın.',
            { length: OTP_CODE_LENGTH }
          )}
        </p>
        {otpTtlActive && (
          <p
            className={`mt-1 text-sm tabular-nums ${
              otpTtlExpired ? 'text-status-warning-text' : 'text-text-tertiary'
            }`}
          >
            {otpTtlExpired
              ? t('code_expired_request_new')
              : `${t('validity_label')}: ${otpTtlFormatted}`}
          </p>
        )}
      </div>

      <Card surface="secondary" padding="compact" shadow={false} className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">{t('premium_membership')}</p>
          <p className="text-sm tabular-nums text-text-secondary">
            {t('my_ewallet')}: {formatCurrency(Number(walletBalance || 0), 'TRY')}
          </p>
        </div>
        <span className="text-lg font-semibold tabular-nums text-text-primary">
          {premiumPrice != null ? formatCurrency(premiumPrice, 'TRY') : '—'}
        </span>
      </Card>

      {suggestedFromInbox && (
        <OtpSuggestionBanner
          suggestedCode={suggestedFromInbox}
          sourceEmail={suggestedEmail}
          onApply={onChangeCode}
        />
      )}

      <OtpDigitInputGroup
        value={verificationCode}
        onChange={onChangeCode}
        dataSlotPrefix="premium-otp"
        disabled={loading || otpTtlExpired}
      />
    </div>
  );
};

export default PremiumUpgradeVerificationStep;
