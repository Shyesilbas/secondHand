import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useChat } from './hooks/useChat.js';
import ChatWindow from './components/ChatWindow.jsx';
import ChatList from './components/ChatList.jsx';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../notification/NotificationContext.jsx';

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
    deleteConversation,
    isDeletingConversation
  } = useChat(user?.id, { enableChatRoomsFetch: true });

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

  const handleDeleteConversation = (roomId) => {
    notification.showConfirmation(
      'Delete Conversation',
      'Are you sure you want to delete this conversation and all messages? This action cannot be undone.',
      () => {
        if (selectedChatRoom?.id === roomId) {
          setIsChatOpen(false);
        }
        deleteConversation(roomId);
        notification.showSuccess('Success', 'Conversation deleted successfully.');
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

  return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Messages
              </h1>
              <p className="text-gray-600 mt-1">Connect with buyers and sellers</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Chat Rooms List */}
            <div className="lg:col-span-4">
              <ChatList
                chatRooms={chatRooms}
                isLoadingRooms={isLoadingRooms}
                selectedChatRoom={selectedChatRoom}
                userId={user?.id}
                isConnected={isConnected}
                onChatRoomSelect={handleChatRoomSelect}
                onListingClick={handleListingClick}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>


            {/* Chat Window - WhatsApp Style */}
            <div className="lg:col-span-8">
              {selectedChatRoom ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden max-h-full">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            selectChatRoom(null);
                            setIsChatOpen(false);
                          }}
                          className="lg:hidden p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {selectedChatRoom.otherParticipantName?.charAt(0).toUpperCase() || 
                             selectedChatRoom.roomName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedChatRoom.otherParticipantName || selectedChatRoom.roomName || 'Unknown User'}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-sm text-gray-600">
                              {isConnected ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 bg-gray-50 min-h-0 overflow-hidden">
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
                            setIsChatOpen(false);
                          }}
                          isEmbedded={true}
                      />
                    </div>
                  </div>
              ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
                      <p className="text-gray-600 max-w-sm mx-auto">Choose a chat from the sidebar to start messaging. Your conversations will appear here.</p>
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
