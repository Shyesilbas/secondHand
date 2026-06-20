import { useTranslation } from "react-i18next";
import { AlertTriangle as ExclamationTriangleIcon, X as XMarkIcon } from 'lucide-react';
const RevokeSessionsModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const {
    t
  } = useTranslation();
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-sm font-medium text-text-primary">{t("revoke_all_sessions")}</h3>
                        </div>
                        <button onClick={onClose} disabled={isLoading} className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">{t("this_action_will_immediately_log_you_out")}</p>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-red-800 mb-1">{t("important_security_notice")}</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        <li>{t("all_active_sessions_will_be_terminated")}</li>
                                        <li>{t("you_ll_be_logged_out_from_all_devices")}</li>
                                        <li>{t("this_action_cannot_be_undone")}</li>
                                        <li>{t("use_this_if_you_suspect_unauthorized_acc")}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">{t("cancel")}</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
                            {isLoading ? <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t("revoking")}</span>
                                </> : <span>{t("revoke_all_sessions")}</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>;
};
export default RevokeSessionsModal;