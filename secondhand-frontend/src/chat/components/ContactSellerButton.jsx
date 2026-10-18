import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { MessageSquare as ChatBubbleLeftRightIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from './ChatWindow.jsx';
import { sameChatId } from '../chatIdUtils.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { useLoginPrompt } from '../../auth/hooks/useLoginPrompt.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
const ContactSellerButton = ({
 listing,
 className = '',
 isDirectChat = false
}) => {
 const {
 t
 } = useTranslation();
 const {
 authState: {
 user,
 isAuthenticated
 }
 } = useAuth();
 const [isChatOpen, setIsChatOpen] = useState(false);
 const promptLogin = useLoginPrompt();
 const { showError } = useNotification();
 const {
 createListingChat,
 createDirectChat,
 selectChatRoom,
 sendMessage,
 deleteMessage,
 deleteConversation,
 messages,
 isLoadingMessages,
 isConnected,
 selectedChatRoom
 } = useChat(user?.id, {
 enableChatRoomsFetch: false,
 connectWebSocket: isChatOpen
 });
 const targetUserId = listing.userId || listing.sellerId;
 if (sameChatId(targetUserId, user?.id)) {
 return null;
 }
 const handleContactSeller = async () => {
 if (!isAuthenticated) {
 promptLogin();
 return;
 }
 try {
 let chatRoom;
 if (isDirectChat) {
 chatRoom = await createDirectChat(targetUserId);
 } else {
 chatRoom = await createListingChat(listing.id, listing.title || listing.name || 'Listing');
 }
 selectChatRoom(chatRoom);
 setIsChatOpen(true);
 } catch (err) {
 showError('Chat', err?.response?.data?.message || 'An error occurred while starting the chat. Please try again later.');
 }
 };
 return <>
 <button onClick={handleContactSeller} className={`${buttonClasses('primary')} ${className}`} title={t("contact_seller")}>
 <ChatBubbleLeftRightIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("contact_seller")}</button>

 {isChatOpen && <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} selectedChatRoom={selectedChatRoom} messages={messages} onSendMessage={sendMessage} onDeleteMessage={deleteMessage} onDeleteConversation={deleteConversation} onConversationDeleted={() => setIsChatOpen(false)} isLoadingMessages={isLoadingMessages} isConnected={isConnected} />}
 </>;
};
export default ContactSellerButton;