import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useChatWindow } from '../hooks/useChatWindow.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import ChatInput from './ChatInput.jsx';
import ReportMessageModal from '../../complaint/components/ReportMessageModal.jsx';
import { useRestrictionFlags } from '../../complaint/hooks/useComplaints.js';
import { CHAT_DEFAULTS, CHAT_MESSAGES } from '../chatConstants.js';

const ChatWindow = ({
  isOpen,
  onClose,
  onBack,
  selectedChatRoom,
  messages,
  onSendMessage,
  onDeleteMessage,
  onDeleteConversation,
  isLoadingMessages,
  isConnected,
  onConversationDeleted,
  isEmbedded = false,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const notification = useNotification();
  const {
    messageText,
    setMessageText,
    messagesEndRef,
    inputRef,
    handleKeyPress,
    handleSendMessage,
    scrollToBottom
  } = useChatWindow({ selectedChatRoom, onSendMessage });

  const { canSendMessages } = useRestrictionFlags();
  const roomLockReasons = {
    BLOCKED: t('chat_lock_blocked', 'Bu kullanıcıyla mesajlaşma kapalı.'),
    LISTING_MESSAGING_DISABLED: t('chat_lock_listing_disabled', 'Bu ilan/sohbet için mesajlaşma kapatıldı.'),
    USER_MESSAGING_DISABLED: t('chat_lock_user_disabled', 'Bu kullanıcı mesaj almıyor.')
  };
  let inputDisabledReason = null;
  if (!canSendMessages) {
    inputDisabledReason = t('chat_lock_restricted', 'Hesabınızdaki kısıtlama nedeniyle mesaj gönderemezsiniz.');
  } else if (selectedChatRoom?.messagingDisabled) {
    inputDisabledReason =
      roomLockReasons[selectedChatRoom.messagingDisabledReason] || roomLockReasons.LISTING_MESSAGING_DISABLED;
  }

  const [reportedMessage, setReportedMessage] = useState(null);
  const canReport = Boolean(selectedChatRoom?.id && selectedChatRoom?.otherParticipantId);
  const reportModal = canReport && (
    <ReportMessageModal
      chatRoom={selectedChatRoom}
      message={reportedMessage}
      onClose={() => setReportedMessage(null)}
    />
  );

  const prevLenRef = useRef(messages?.length || 0);
  const messagesContainerRef = useRef(null);
  const prevChatRoomIdRef = useRef(selectedChatRoom?.id);

  useEffect(() => {
    const currentChatRoomId = selectedChatRoom?.id;
    const prevChatRoomId = prevChatRoomIdRef.current;

    if (currentChatRoomId !== prevChatRoomId) {
      prevChatRoomIdRef.current = currentChatRoomId;
      prevLenRef.current = 0;
      const timer = setTimeout(() => {
        scrollToBottom();
      }, CHAT_DEFAULTS.INITIAL_SCROLL_DELAY_MS);
      return () => clearTimeout(timer);
    }

    if (messages?.length > 0 && !isLoadingMessages) {
      const prev = prevLenRef.current;
      const curr = messages?.length || 0;
      if (prev === 0 || curr > prev) {
        const timer = setTimeout(() => {
          scrollToBottom();
        }, CHAT_DEFAULTS.NEW_MESSAGE_SCROLL_DELAY_MS);
        prevLenRef.current = curr;
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [messages, selectedChatRoom, scrollToBottom, isLoadingMessages]);

  const handleDeleteMessage = (messageId) => {
    if (!onDeleteMessage) return;
    onDeleteMessage(messageId);
    notification.showSuccess(CHAT_MESSAGES.SUCCESS_TITLE, CHAT_MESSAGES.MESSAGE_DELETED);
  };

  if (!isOpen) return null;

  const content = (
    <>
      <ChatHeader
        selectedChatRoom={selectedChatRoom}
        isConnected={isConnected}
        onClose={onClose}
        onBack={onBack}
        onDeleteConversation={onDeleteConversation}
        onConversationDeleted={onConversationDeleted}
        isEmbedded={isEmbedded}
      />
      <MessageList
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
        user={user}
        onDeleteMessage={onDeleteMessage ? handleDeleteMessage : undefined}
        onReportMessage={canReport ? setReportedMessage : undefined}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      <ChatInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleKeyPress={handleKeyPress}
        handleSendMessage={handleSendMessage}
        inputRef={inputRef}
        isEmbedded={isEmbedded}
        disabledReason={inputDisabledReason}
      />
      {reportModal}
    </>
  );

  if (isEmbedded) {
    return <div className="flex h-full min-h-0 flex-col overflow-hidden">{content}</div>;
  }

  return (
    <div
      style={{ height: '31rem' }}
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-dropdown flex w-96 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded border border-border bg-background-primary shadow-md"
    >
      {content}
    </div>
  );
};

export default ChatWindow;
