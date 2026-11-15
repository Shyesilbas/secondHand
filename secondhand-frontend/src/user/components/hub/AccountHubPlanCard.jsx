import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import Button from '@/common/components/ui/Button';
import { Badge, Card } from '../../../common/components/ui/index.js';
import { formatDate } from '../../../common/formatters.js';

const DetailRow = ({ label, value, hint }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-text-secondary">{label}</span>
    <span className="text-right font-medium tabular-nums text-text-primary">
      {value}
      {hint ? <span className="ml-1.5 text-xs font-normal text-text-tertiary">{hint}</span> : null}
    </span>
  </div>
);

const AccountHubPlanCard = ({
  plan,
  isPremium,
  expirationDate,
  dailyAuraUsage,
  dailyAuraLimit,
  maxShowcaseSlots,
  activeShowcasesCount,
  estimatedShippingDays,
  autoRenew,
  isCancelling,
  isTogglingAutoRenew,
  onRequestCancel,
  onToggleAutoRenew,
  onOpenUpgrade,
  trEn
}) => {
  const { t } = useTranslation();

  return (
    <Card as="section" shadow={false} className="flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border-light pb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {t('membership_and_privileges', 'Membership')}
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              {isPremium
                ? trEn('Aktif üyelik ayrıcalıklarınız', 'Your active membership privileges')
                : trEn('Hesap planınız ve yükseltme seçenekleri', 'Your plan and upgrade options')}
            </p>
          </div>
          <Badge variant={isPremium ? 'warning' : 'neutral'} dot className="shrink-0">
            {isPremium ? plan || 'PRO' : t('standard', 'Standard')}
          </Badge>
        </div>

        <div className="divide-y divide-border-light text-sm">
          <DetailRow
            label={t('fast_shipping', 'Fast Shipping')}
            value={`${estimatedShippingDays} ${t('day', 'day')}`}
          />
          <DetailRow
            label={t('showcase_slot', 'Showcase Slot')}
            value={`${activeShowcasesCount} / ${maxShowcaseSlots}`}
          />
          <DetailRow
            label={t('aura_ai_message_limit', 'Aura AI Limit')}
            value={`${dailyAuraUsage} / ${dailyAuraLimit || (isPremium ? 8 : 2)}`}
          />
          {isPremium && expirationDate && (
            <DetailRow
              label={t('end_date', 'End Date')}
              value={formatDate(expirationDate)}
            />
          )}
          {isPremium && (
            <DetailRow
              label={t('auto_renew', 'Auto Renewal')}
              value={autoRenew ? trEn('Açık', 'Enabled') : t('disabled', 'Disabled')}
            />
          )}
        </div>
      </div>

      <div className="mt-5 pt-2">
        {isPremium ? (
          autoRenew ? (
            <Button
              variant="danger"
              className="w-full"
              onClick={onRequestCancel}
              disabled={isCancelling}
            >
              {isCancelling
                ? t('processing_progress', 'Processing…')
                : t('cancel_subscription', 'Cancel Subscription')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onToggleAutoRenew(true)}
              disabled={isTogglingAutoRenew}
            >
              {isTogglingAutoRenew
                ? t('enabling', 'Enabling...')
                : t('reactivate', 'Reactivate')}
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            className="flex w-full items-center justify-center gap-2"
            onClick={onOpenUpgrade}
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            <span>{trEn('Premium Avantajları için tıklayın', 'Click for Premium Privileges')}</span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AccountHubPlanCard;
