import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import PageContainer from '@/common/components/layout/PageContainer';
import { Badge, EmptyState, PageHeader } from '../../common/components/ui/index.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from '../components/ChatWindow.jsx';
import ChatList from '../components/ChatList.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CHAT_MESSAGES } from '../chatConstants.js';

const ChatPage = ({ embedded = false }) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const notification = useNotification();

  const {
    chatRooms,
    totalRooms,
    hasMoreRooms,
    isFetchingMoreRooms,
    fetchMoreRooms,
    selectedChatRoom,
    messages,
    isConnected,
    isLoadingRooms,
    selectChatRoom,
    sendMessage,
    isLoadingMessages,
    deleteMessage,
    deleteConversation
  } = useChat(user?.id, {
    enableChatRoomsFetch: true
  });

  const syncRoomToUrl = useCallback(
    (room) => {
      if (!location.pathname.startsWith(ROUTES.INBOX)) {
        return;
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', 'chat');
          if (room?.id) {
            next.set('room', String(room.id));
          } else {
            next.delete('room');
          }
          return next;
        },
        { replace: true }
      );
    },
    [location.pathname, setSearchParams]
  );

  useEffect(() => {
    const roomId = searchParams.get('room');
    if (!roomId || !chatRooms?.length) {
      return;
    }
    const found = chatRooms.find((r) => String(r.id) === String(roomId));
    if (found && selectedChatRoom?.id !== found.id) {
      selectChatRoom(found);
    }
  }, [searchParams, chatRooms, selectedChatRoom?.id, selectChatRoom]);

  const handleChatRoomSelect = (chatRoom) => {
    selectChatRoom(chatRoom);
    syncRoomToUrl(chatRoom);
  };

  const handleClearSelection = () => {
    selectChatRoom(null);
    syncRoomToUrl(null);
  };

  const handleBrowseListings = () => {
    navigate(ROUTES.LISTINGS);
  };

  const handleDeleteConversation = (roomId) => {
    notification.showConfirmation(
      CHAT_MESSAGES.DELETE_CONVERSATION_TITLE,
      CHAT_MESSAGES.DELETE_CONVERSATION_CONFIRMATION,
      () => {
        if (selectedChatRoom?.id === roomId) {
          handleClearSelection();
        }
        deleteConversation(roomId);
        notification.showSuccess(CHAT_MESSAGES.SUCCESS_TITLE, CHAT_MESSAGES.CONVERSATION_DELETED);
      }
    );
  };

  if (!user) {
    return (
      <PageContainer className="py-8">
        <EmptyState
          icon={MessageCircle}
          title={t('messages', 'Mesajlar')}
          description={t('please_login_to_see_your_messages', 'Mesajlarınızı görmek için lütfen giriş yapın.')}
        />
      </PageContainer>
    );
  }

  const chatShell = (
    <div
      className={
        embedded
          ? 'flex h-full min-h-0 w-full flex-col overflow-hidden rounded border border-border-light bg-background-primary shadow-sm'
          : 'flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-border-light bg-background-primary shadow-sm'
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-12">
        <section
          aria-label={t('conversations', 'Sohbetler')}
          className={`min-h-0 w-full min-w-0 flex-col border-border-light bg-background-primary lg:col-span-5 lg:border-r xl:col-span-4 ${
            selectedChatRoom ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <ChatList
            chatRooms={chatRooms}
            totalRooms={totalRooms}
            hasMoreRooms={hasMoreRooms}
            isFetchingMoreRooms={isFetchingMoreRooms}
            onLoadMoreRooms={fetchMoreRooms}
            isLoadingRooms={isLoadingRooms}
            selectedChatRoom={selectedChatRoom}
            userId={user?.id}
            isConnected={isConnected}
            onChatRoomSelect={handleChatRoomSelect}
            onBrowseListings={handleBrowseListings}
            onDeleteConversation={handleDeleteConversation}
          />
        </section>

        <section
          aria-label={t('messages', 'Mesajlar')}
          className={`min-h-0 min-w-0 flex-1 flex-col bg-background-primary lg:col-span-7 xl:col-span-8 ${
            selectedChatRoom ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedChatRoom ? (
            <ChatWindow
              isOpen
              isEmbedded
              onBack={handleClearSelection}
              onClose={handleClearSelection}
              selectedChatRoom={selectedChatRoom}
              messages={messages}
              onSendMessage={sendMessage}
              onDeleteMessage={deleteMessage}
              onDeleteConversation={deleteConversation}
              isLoadingMessages={isLoadingMessages}
              isConnected={isConnected}
              onConversationDeleted={handleClearSelection}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={MessageCircle}
                title={t('select_a_conversation', 'Bir sohbet seçin')}
                description={t(
                  'choose_a_chat_from_the_sidebar_to_start_',
                  'Mesajlaşmaya başlamak için soldaki listeden bir sohbet seçin.'
                )}
                className="border-0"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );

  if (embedded) {
    return chatShell;
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background-page">
      <PageContainer className="flex min-h-0 flex-1 flex-col py-6">
        <PageHeader
          className="mb-6"
          title={t('messages', 'Mesajlar')}
          subtitle={t('connect_with_buyers_and_sellers', 'Alıcılar ve satıcılarla doğrudan iletişim kurun.')}
          actions={
            <Badge variant={isConnected ? 'success' : 'neutral'} dot>
              {isConnected ? t('chat_online', 'Çevrimiçi') : t('chat_offline', 'Çevrimdışı')}
            </Badge>
          }
        />
        {chatShell}
      </PageContainer>
    </div>
  );
};

export default ChatPage;
