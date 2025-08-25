import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../features/chat/hooks/useChat';
import ChatWindow from '../../features/chat/components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import EmptyState from '../../components/ui/EmptyState';
import AvatarMessageItem from '../../components/ui/AvatarMessageItem';

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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mesajlar</h2>
            <p className="text-gray-600">Mesajları görüntülemek için giriş yapın.</p>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Mesajlar</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">
              {isConnected ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Rooms List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Sohbetler</h2>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoadingRooms ? (
                      <div className="p-4 text-center">
                        <LoadingIndicator />
                      </div>
                  ) : chatRooms.length === 0 ? (
                      <EmptyState icon={ChatBubbleLeftRightIcon} title="No Messages Yet" description="Contact with a seller" />
                  ) : (
                      chatRooms.map((room) => (
                          <ChatRoomListItem
                              key={room.id}
                              room={room}
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
            <div className="lg:col-span-2">
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
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Bir sohbet seçin</p>
                    <p className="text-sm">Mesajlaşmaya başlamak için sol taraftan bir sohbet seçin</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

const ChatRoomListItem = ({ room, isSelected, onClick, onListingClick }) => {
  const { user } = useAuth();

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
    return room.lastMessageSenderId === user?.id
        ? 'You'
        : room.lastMessageSenderName || `User ${room.lastMessageSenderId}`;
  };

  return (
      <div onClick={onClick} className={`cursor-pointer ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
        <AvatarMessageItem
          containerClassName="p-4 border-b border-gray-100"
          title={room.listingTitle ? (
            <div className="flex flex-col">
              <span className="text-gray-700">{room.otherParticipantName}</span>
              <div className="flex items-center space-x-1">
                <span>İlan:</span>
                <button
                  onClick={(e) => onListingClick && onListingClick(room.listingId, e)}
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                  title="İlanı görüntüle"
                >
                  {room.listingTitle}
                </button>
              </div>
            </div>
          ) : getRoomTitle()}
          subtitle={room.lastMessage ? `${getLastMessageSenderName()}: ${room.lastMessage}` : getRoomSubtitle()}
          createdAt={room.lastMessageTime}
        />
      </div>
  );
};


export default ChatPage;
