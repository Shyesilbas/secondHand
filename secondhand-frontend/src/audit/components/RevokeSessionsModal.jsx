import { useTranslation } from "react-i18next";
import { Button, Modal } from '../../common/components/ui/index.js';

const RevokeSessionsModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={t("revoke_all_sessions", "Tüm Oturumları Kapat")}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t("cancel", "Vazgeç")}</Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t("revoking", "Kapatılıyor...") : t("revoke_all_sessions", "Oturumları Kapat")}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        {t(
          "this_action_will_immediately_log_you_out",
          "Bu işlem şu anda kullandığınız cihaz da dahil olmak üzere tüm aktif cihaz ve tarayıcılardaki oturumlarınızı anında sonlandırır."
        )}
      </p>
      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
        <li>{t("all_active_sessions_will_be_terminated", "Tüm aktif oturumlar derhal sonlandırılır.")}</li>
        <li>{t("you_ll_be_logged_out_from_all_devices", "Tüm cihazlardan çıkış yapılacak ve oturumunuz kapatılacaktır.")}</li>
        <li className="text-status-error-text">{t("this_action_cannot_be_undone", "Bu işlem geri alınamaz.")}</li>
      </ul>
    </Modal>
  );
};

export default RevokeSessionsModal;
