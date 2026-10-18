import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { formatDateTime } from '../../common/formatters.js';
import { Copy, Check } from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';

const STATUS_DOT = {
  SUCCESS: 'bg-status-success',
  FAILURE: 'bg-status-error',
};

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
    <dt className="shrink-0 text-text-secondary">{label}</dt>
    <dd className="text-right text-text-primary">{children}</dd>
  </div>
);

const LogDetailModal = ({
  selectedLog,
  setSelectedLog,
  getEventTypeDisplay,
  getBrowserInfo
}) => {
  const { t } = useTranslation();
  const [copiedIp, setCopiedIp] = useState(false);

  if (!selectedLog) {
    return null;
  }

  const close = () => setSelectedLog(null);
  const handleCopyIp = () => {
    if (selectedLog.ipAddress && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(selectedLog.ipAddress);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const isFailure = selectedLog.eventStatus === 'FAILURE' || selectedLog.eventType?.includes('FAILURE');
  const dot = isFailure ? STATUS_DOT.FAILURE : STATUS_DOT[selectedLog.eventStatus] || 'bg-status-warning';

  return (
    <Modal
      isOpen
      onClose={close}
      title={t("event_details", "Güvenlik Hareketi Detayı")}
      size="md"
      footer={<Button onClick={close}>{t("close", "Kapat")}</Button>}
    >
      <dl className="divide-y divide-border-light">
        <Row label={t("event_type", "Olay Türü")}>{getEventTypeDisplay(selectedLog.eventType)}</Row>
        <Row label={t("status", "Durum")}>
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
            {selectedLog.eventStatus}
          </span>
        </Row>
        {selectedLog.details && <Row label={t("details", "Açıklama / Mesaj")}>{selectedLog.details}</Row>}
        <Row label={t("date_time", "Tarih ve Saat")}>
          <span className="tabular-nums">{formatDateTime(selectedLog.createdAt)}</span>
        </Row>
        <Row label={t("ip_address", "IP Adresi")}>
          <span className="inline-flex items-center gap-2">
            <span className="font-mono">{selectedLog.ipAddress || 'Bilinmiyor'}</span>
            {selectedLog.ipAddress && (
              <button
                type="button"
                onClick={handleCopyIp}
                className="rounded p-1 text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                aria-label="IP adresini kopyala"
              >
                {copiedIp ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            )}
          </span>
        </Row>
        <Row label={t("device_browser", "Cihaz & Tarayıcı")}>{getBrowserInfo(selectedLog.userAgent)}</Row>
      </dl>
    </Modal>
  );
};

export default LogDetailModal;
