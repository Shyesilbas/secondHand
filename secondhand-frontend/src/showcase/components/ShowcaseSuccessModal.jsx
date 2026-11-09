import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FileCheck2, Package } from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { formatCurrency } from '../../common/formatters.js';
import { useRequiredAgreements } from '../../agreements/hooks/useAgreements.js';
import { AGREEMENT_TYPE_LABELS } from '../../agreements/agreements.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';

const ShowcaseSuccessModal = ({
  isOpen,
  onClose,
  listingTitle,
  days,
  pricePaid,
  isExtension = false,
  listingImage = null
}) => {
  const { t } = useTranslation();
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const { agreements: paymentAgreements = [] } = useRequiredAgreements('ONLINE_PAYMENT');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isExtension
            ? t('showcase_extended_title', 'Vitrin Süresi Uzatıldı')
            : t('showcase_success_title', 'İlanınız Vitrine Eklendi')
        }
        size="sm"
        footer={
          <Button className="w-full sm:w-auto" onClick={onClose}>
            {t('close', 'Tamam')}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-status-success"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {listingTitle ? (
                <>
                  <span className="font-medium text-text-primary">{listingTitle}</span>{' '}
                </>
              ) : null}
              {isExtension
                ? t(
                  'showcase_extended_desc',
                  'ilanınızın vitrin süresi başarıyla uzatıldı.'
                )
                : t(
                  'showcase_success_desc',
                  'ilanınız başarıyla vitrine taşındı ve öncelikli olarak sergilenmeye başladı.'
                )}
            </p>
          </div>

          {listingTitle && (
            <div className="flex items-center gap-3 rounded border border-border-light bg-background-secondary/40 p-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-primary">
                {listingImage ? (
                  <img src={listingImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                )}
              </div>
              <span className="truncate text-xs font-medium text-text-primary">
                {listingTitle}
              </span>
            </div>
          )}

          {(days || pricePaid) && (
            <dl className="divide-y divide-border-light rounded border border-border-light px-3.5 text-xs sm:text-sm">
              {days && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-text-secondary">
                    {isExtension ? t('added_duration', 'Eklenen Süre') : t('showcase_duration', 'Vitrin Süresi')}
                  </dt>
                  <dd className="font-medium tabular-nums text-text-primary">{t('days_count', { count: days, defaultValue: '{{count}} Gün' })}</dd>
                </div>
              )}
              {pricePaid && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-text-secondary">{t('amount_paid', 'Ödenen Tutar')}</dt>
                  <dd className="font-semibold tabular-nums text-text-primary">
                    {formatCurrency(Number(pricePaid), 'TRY')}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {paymentAgreements.length > 0 && (
            <div className="space-y-1.5 border-t border-border-light pt-3">
              <span className="block text-xs font-medium text-text-secondary">
                {t('approved_agreements', 'Onaylanan Sözleşmeler')}
              </span>
              <div className="divide-y divide-border-light rounded border border-border-light bg-background-primary">
                {paymentAgreements.map((agreement) => (
                  <div
                    key={agreement.agreementId}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileCheck2
                        className="h-3.5 w-3.5 shrink-0 text-status-success"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span className="truncate text-text-primary">
                        {AGREEMENT_TYPE_LABELS[agreement.agreementType] ||
                          agreement.agreementTypeDisplayName ||
                          agreement.agreementType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAgreement(agreement)}
                      className="shrink-0 font-medium text-text-secondary underline underline-offset-2 hover:text-text-primary cursor-pointer"
                    >
                      {t('read', 'Oku')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <AgreementModal
        agreement={selectedAgreement}
        isOpen={Boolean(selectedAgreement)}
        onClose={() => setSelectedAgreement(null)}
        isAccepted={true}
      />
    </>
  );
};

export default ShowcaseSuccessModal;
