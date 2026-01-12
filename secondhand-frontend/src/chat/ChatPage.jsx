import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useChat } from './hooks/useChat.js';
import ChatWindow from './components/ChatWindow.jsx';
import ChatList from './components/ChatList.jsx';
import { useNavigate } from 'react-router-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { MessageCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
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
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100vh-200px)] bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
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
                            setIsChatOpen(false);
                          }}
                          className="lg:hidden p-2 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out"
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-base font-bold text-white tracking-tight">
                            {selectedChatRoom.otherParticipantName?.charAt(0).toUpperCase() || 
                             selectedChatRoom.roomName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {selectedChatRoom.otherParticipantName || selectedChatRoom.roomName || 'Unknown User'}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                            <span className="text-xs font-medium text-slate-500 tracking-tight">
                              {isConnected ? 'Online' : 'Offline'}
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
                            setIsChatOpen(false);
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
