import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { AlertTriangle as ExclamationTriangleIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useComplaints } from '../hooks/useComplaints.js';
import ComplaintModal from './ComplaintModal.jsx';
import { useLoginPrompt } from '../../auth/hooks/useLoginPrompt.js';
const ComplaintButton = ({
 targetUserId,
 targetUserName,
 targetUser,
 listingId,
 listingTitle,
 className = ""
}) => {
 const {
 t
 } = useTranslation();
 const [showModal, setShowModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const {
 authState: {
 user: currentUser,
 isAuthenticated
 }
 } = useAuth();
 const {
 createComplaint
 } = useComplaints();
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
 setIsSubmitting(true);
 try {
 await createComplaint({
 complainerId: currentUser.id,
 complainedUserId: targetUser?.id || targetUserId,
 listingId,
 reason: complaintData.reason,
 description: complaintData.description
 });
 } finally {
 setIsSubmitting(false);
 }
 };
 return <>
 <button onClick={handleReportClick} className={`inline-flex items-center gap-2 px-3 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors text-sm ${className}`} title={`Report ${targetUserName}`}>
 <ExclamationTriangleIcon className="w-4 h-4" />{t("report")}</button>

 <ComplaintModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleComplaint} targetUserName={targetUserName} targetUserId={targetUserId} listingId={listingId} listingTitle={listingTitle} isLoading={isSubmitting} />
 </>;
};
export default ComplaintButton;