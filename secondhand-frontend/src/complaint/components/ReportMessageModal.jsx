import { useCreateComplaint } from '../hooks/useComplaints.js';
import ComplaintModal from './ComplaintModal.jsx';

/** Reports one chat message of the other participant; the backend checks room membership and sender. */
const ReportMessageModal = ({ chatRoom, message, onClose }) => {
  const createMutation = useCreateComplaint();
  const handleSubmit = (data) => createMutation.mutateAsync({
    complainedUserId: chatRoom.otherParticipantId,
    chatRoomId: chatRoom.id,
    reportedMessageId: message.id,
    reason: data.reason,
    description: data.description,
    evidenceImageUrls: data.evidenceImageUrls,
  });
  return (
    <ComplaintModal
      isOpen={Boolean(message)}
      onClose={onClose}
      onSubmit={handleSubmit}
      targetUserName={chatRoom?.otherParticipantName}
      targetUserId={chatRoom?.otherParticipantId}
      chatRoomId={chatRoom?.id}
      reportedMessage={message}
      isLoading={createMutation.isPending}
    />
  );
};

export default ReportMessageModal;
