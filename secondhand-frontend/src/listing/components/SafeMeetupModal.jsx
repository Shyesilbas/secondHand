import { useTranslation } from 'react-i18next';
import { Lock, MapPin, QrCode } from 'lucide-react';
import Modal from '../../common/components/ui/Modal.jsx';

const STEPS = [
  {
    key: 'escrow',
    Icon: Lock,
    title: ['safe_step_escrow_title', 'Ödemen güvencede bekler'],
    body: ['safe_step_escrow_body', 'Ödemen güvence havuzunda tutulur; sen onay vermeden satıcıya aktarılmaz.']
  },
  {
    key: 'inspect',
    Icon: MapPin,
    title: ['safe_step_inspect_title', 'Ürünü yerinde incele'],
    body: ['safe_step_inspect_body', 'Ürünü kamusal ve aydınlık bir noktada teslim al, fiziksel durumunu kontrol et.']
  },
  {
    key: 'confirm',
    Icon: QrCode,
    title: ['safe_step_confirm_title', 'Kodla teslimi onayla'],
    body: ['safe_step_confirm_body', 'Teslim aldıktan sonra QR veya PIN kodunu satıcıyla paylaş; ödeme o anda aktarılır.']
  }
];

// Explains the escrow-backed purchase flow; opened from the buy box "How it works" link.
const SafeMeetupModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('safe_purchase_title', 'Güvenli alışveriş nasıl çalışır')}
      size="sm"
    >
      <ol className="space-y-5">
        {STEPS.map(({ key, Icon, title, body }, idx) => (
          <li key={key} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border text-text-secondary">
              <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                <span className="tabular-nums text-text-tertiary">{idx + 1}. </span>
                {t(title[0], title[1])}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{t(body[0], body[1])}</p>
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  );
};

export default SafeMeetupModal;
