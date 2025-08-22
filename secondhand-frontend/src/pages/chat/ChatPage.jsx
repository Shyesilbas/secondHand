import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../features/chat/hooks/useChat';
import ChatWindow from '../../features/chat/components/ChatWindow';
import AllMessagesPage from './AllMessagesPage';
import { ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const ChatPage = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' veya 'all-messages'
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

  console.log('ChatPage - chatRooms:', chatRooms);
  console.log('ChatPage - chatRooms.length:', chatRooms?.length);
  console.log('ChatPage - selectedChatRoom:', selectedChatRoom);
  console.log('ChatPage - messages:', messages);

  const handleChatRoomSelect = (chatRoom) => {
    selectChatRoom(chatRoom);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sohbetler
              </button>
              <button
                onClick={() => setActiveTab('all-messages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tüm Mesajlar
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'rooms' ? (
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : chatRooms.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Henüz sohbet yok</p>
                      <p className="text-sm">Bir ilan hakkında satıcı ile iletişime geçin</p>
                    </div>
                  ) : (
                    chatRooms.map((room) => (
                      <ChatRoomItem
                        key={room.id}
                        room={room}
                        isSelected={selectedChatRoom?.id === room.id}
                        onClick={() => handleChatRoomSelect(room)}
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
        ) : (
          <AllMessagesPage />
        )}
      </div>
    </div>
  );
};

const ChatRoomItem = ({ room, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <UserCircleIcon className="w-6 h-6 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {room.roomName}
          </h3>
          <p className="text-xs text-gray-500">
            {room.lastMessage ? (
              <>
                {room.lastMessage}
                <span className="ml-2">
                  {formatDistanceToNow(new Date(room.lastMessageTime), {
                    addSuffix: true,
                    locale: tr
                  })}
                </span>
              </>
            ) : (
              'Henüz mesaj yok'
            )}
          </p>
        </div>
        {room.unreadCount > 0 && (
          <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {room.unreadCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
