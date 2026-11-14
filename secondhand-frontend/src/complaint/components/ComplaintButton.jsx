import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { AlertTriangle as ExclamationTriangleIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useCreateComplaint } from '../hooks/useComplaints.js';
import ComplaintModal from './ComplaintModal.jsx';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { useLoginPrompt } from '../../auth/hooks/useLoginPrompt.js';
const ComplaintButton = ({
 targetUserId,
 targetUserName,
 targetUser,
 listingId,
 listingTitle,
 className = "",
 variant = "solid"
}) => {
 const {
 t
 } = useTranslation();
 const [showModal, setShowModal] = useState(false);
 const {
 authState: {
 user: currentUser,
 isAuthenticated
 }
 } = useAuth();
 const createMutation = useCreateComplaint();
 const promptLogin = useLoginPrompt();
 const handleReportClick = () => {
 if (!isAuthenticated) {
 promptLogin();
 return;
 }
 setShowModal(true);
 };
 const handleComplaint = async complaintData => {
 if (!currentUser?.id) throw new Error('User not authenticated');
 if (!targetUser?.id && !targetUserId) throw new Error('Target user not found');
 await createMutation.mutateAsync({
 complainedUserId: targetUser?.id || targetUserId,
 listingId,
 reason: complaintData.reason,
 description: complaintData.description,
 evidenceImageUrls: complaintData.evidenceImageUrls
 });
 };
 return <>
 <button type="button" onClick={handleReportClick} className={variant === "ghost" ? `${buttonClasses('ghost', 'sm')} ${className}` : `inline-flex items-center gap-2 px-3 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors text-sm ${className}`} title={`Report ${targetUserName}`}>
 <ExclamationTriangleIcon className="w-4 h-4" strokeWidth={1.5} aria-hidden />{t("report")}</button>

 <ComplaintModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleComplaint} targetUserName={targetUserName} targetUserId={targetUserId} listingId={listingId} listingTitle={listingTitle} isLoading={createMutation.isPending} />
 </>;
};
export default ComplaintButton;