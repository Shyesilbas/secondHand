import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useChat } from './hooks/useChat.js';
import ChatWindow from './components/ChatWindow.jsx';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import LoadingIndicator from '../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import AvatarMessageItem from '../common/components/ui/AvatarMessageItem.jsx';
import { chatService } from "./services/chatService.js";

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const {
    chatRooms,
    selectedChatRoom,
    messages,
    isConnected,
    isLoadingRooms,
    selectChatRoom,
    sendMessage,
    isLoadingMessages
  } = useChat(user?.id);

  const handleChatRoomSelect = (chatRoom) => {
    selectChatRoom(chatRoom);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleListingClick = (listingId, event) => {
    event.stopPropagation();
    if (listingId) {
      navigate(`/listings/${listingId}`);
    }
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

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-gray-600 mt-2">Connect with buyers and sellers</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Chat Rooms List */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoadingRooms ? (
                      <div className="p-4 text-center">
                        <LoadingIndicator />
                      </div>
                  ) : chatRooms.length === 0 ? (
                      <EmptyState
                          icon={ChatBubbleLeftRightIcon}
                          title="No Messages Yet"
                          description="Start a conversation with a seller"
                      />
                  ) : (
                      chatRooms.map((room) => (
                          <ChatRoomListItem
                              key={room.id}
                              room={room}
                              userId={user?.id}
                              isSelected={selectedChatRoom?.id === room.id}
                              onClick={() => handleChatRoomSelect(room)}
                              onListingClick={handleListingClick}
                          />
                      ))
                  )}
                </div>
              </div>
            </div>


            {/* Chat Window */}
            <div className="lg:col-span-8">
              {selectedChatRoom ? (
                  <ChatWindow
                      isOpen={isChatOpen}
                      onClose={handleCloseChat}
                      selectedChatRoom={selectedChatRoom}
                      messages={messages}
                      onSendMessage={sendMessage}
                      isLoadingMessages={isLoadingMessages}
                      isConnected={isConnected}
                  />
              ) : (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

const ChatRoomListItem = ({ room, isSelected, onClick, onListingClick, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!userId) return;
        const res = await chatService.getChatRoomUnreadCount(room.id, userId);
        setUnreadCount(res || 0);
      } catch (err) {
        console.error('Unread count fetch error', err);
      }
    };
    fetchUnread();
  }, [room.id, userId]);

  const getRoomTitle = () => {
    if (room.otherParticipantName) return room.otherParticipantName;
    if (room.listingTitle) return `Listing: ${room.listingTitle}`;
    return room.roomName;
  };

  const getRoomSubtitle = () => {
    if (room.roomType === 'LISTING' && room.otherParticipantName)
      return `Seller: ${room.otherParticipantName}`;
    if (room.roomType === 'DIRECT' && room.otherParticipantName) return 'Message';
    return room.roomName;
  };

  const getLastMessageSenderName = () => {
    if (!room.lastMessageSenderId) return '';
    return room.lastMessageSenderId === userId
        ? 'You'
        : room.lastMessageSenderName || `User ${room.lastMessageSenderId}`;
  };

  return (
      <div onClick={onClick} className={`relative cursor-pointer ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
        <div className="flex justify-between items-center">
          <AvatarMessageItem
              containerClassName="p-4 border-b border-gray-100 flex-1"
              title={
                room.listingTitle ? (
                    <div className="flex flex-col">
                      <span className="text-text-secondary">{room.otherParticipantName}</span>
                      <div className="flex items-center space-x-1">
                        <span>İlan:</span>
                        <button
                            onClick={(e) => onListingClick && onListingClick(room.listingId, e)}
                            className="text-btn-primary hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                            title="İlanı görüntüle"
                        >
                          {room.listingTitle}
                        </button>
                      </div>
                    </div>
                ) : (
                    getRoomTitle()
                )
              }
              subtitle={room.lastMessage ? `${getLastMessageSenderName()}: ${room.lastMessage}` : getRoomSubtitle()}
              createdAt={room.lastMessageTime}
          />

          {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full shadow-lg animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
          )}
        </div>
      </div>
  );
};

export default ChatPage;
