import React, { useCallback, useEffect } from 'react';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {useChat} from '../hooks/useChat.js';
import ChatWindow from '../components/ChatWindow.jsx';
import ChatList from '../components/ChatList.jsx';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {EllipsisVertical as EllipsisVerticalIcon, MessageCircle} from 'lucide-react';
import {useNotification} from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CHAT_MESSAGES } from '../chatConstants.js';

const ChatPage = ({ embedded = false }) => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const notification = useNotification();
  const {
    chatRooms,
    selectedChatRoom,
    messages,
    isConnected,
    isLoadingRooms,
    selectChatRoom,
    sendMessage,
    isLoadingMessages,
    deleteMessage,
    deleteConversation
  } = useChat(user?.id, { enableChatRoomsFetch: true });

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

  const handleListingClick = (listingId, event) => {
    event.stopPropagation();
    if (listingId) {
      navigate(ROUTES.LISTING_DETAIL(listingId));
    }
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
          selectChatRoom(null);
          syncRoomToUrl(null);
        }
        deleteConversation(roomId);
        notification.showSuccess(CHAT_MESSAGES.SUCCESS_TITLE, CHAT_MESSAGES.CONVERSATION_DELETED);
      }
    );
  };

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Messages</h2>
            <p className="text-text-secondary">Please Login to see your messages.</p>
          </div>
        </div>
    );
  }

  const gridHeightClass = embedded ? 'h-[min(72vh,calc(100vh-260px))]' : 'h-[calc(100vh-200px)]';

  return (
      <div className={embedded ? 'min-h-0 bg-transparent' : 'min-h-screen bg-slate-50'}>
        <div className={`max-w-[1600px] mx-auto ${embedded ? 'px-0 py-0' : 'px-6 lg:px-8 py-8'}`}>
          {!embedded && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  Messages
                </h1>
                <p className="text-slate-500 mt-2 tracking-tight">Connect with buyers and sellers</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm font-semibold text-slate-700 tracking-tight">
                    {isConnected ? CHAT_MESSAGES.ONLINE : CHAT_MESSAGES.OFFLINE}
                  </span>
                </div>
              </div>
            </div>
          )}

          {embedded && (
            <div className="mb-3 flex justify-end">
              <div className="flex items-center space-x-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2 shadow-sm">
                <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {isConnected ? CHAT_MESSAGES.ONLINE : CHAT_MESSAGES.OFFLINE}
                </span>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${gridHeightClass} overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm`}>
            {/* Chat Rooms List */}
            <div className="lg:col-span-4 border-r border-slate-200/60 h-full flex flex-col overflow-hidden">
              <ChatList
                chatRooms={chatRooms}
                isLoadingRooms={isLoadingRooms}
                selectedChatRoom={selectedChatRoom}
                userId={user?.id}
                isConnected={isConnected}
                onChatRoomSelect={handleChatRoomSelect}
                onListingClick={handleListingClick}
                onBrowseListings={handleBrowseListings}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>


            {/* Chat Window */}
            <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
              {selectedChatRoom ? (
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200/60 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            selectChatRoom(null);
                            syncRoomToUrl(null);
                          }}
                          className="lg:hidden p-2 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out"
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-base font-bold text-white tracking-tight">
                            {(selectedChatRoom.otherParticipantName || selectedChatRoom.title || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {selectedChatRoom.otherParticipantName || selectedChatRoom.title || 'Chat'}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                            <span className="text-xs font-medium text-slate-500 tracking-tight">
                              {isConnected ? CHAT_MESSAGES.ONLINE : CHAT_MESSAGES.OFFLINE}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2.5 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out">
                          <EllipsisVerticalIcon className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 bg-slate-50/50 min-h-0 overflow-hidden">
                      <ChatWindow
                          isOpen={true}
                          onClose={() => {}}
                          selectedChatRoom={selectedChatRoom}
                          messages={messages}
                          onSendMessage={sendMessage}
                          onDeleteMessage={deleteMessage}
                          onDeleteConversation={deleteConversation}
                          isLoadingMessages={isLoadingMessages}
                          isConnected={isConnected}
                          onConversationDeleted={() => {
                            selectChatRoom(null);
                            syncRoomToUrl(null);
                          }}
                          isEmbedded={true}
                      />
                    </div>
                  </div>
              ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center px-8">
                      <div className="w-28 h-28 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <MessageCircle className="w-14 h-14 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Select a conversation</h3>
                      <p className="text-slate-500 max-w-sm mx-auto tracking-tight leading-relaxed">Choose a chat from the sidebar to start messaging. Your conversations will appear here.</p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ChatPage;
