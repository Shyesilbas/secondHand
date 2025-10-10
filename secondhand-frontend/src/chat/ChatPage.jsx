import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useChat } from './hooks/useChat.js';
import ChatWindow from './components/ChatWindow.jsx';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingIndicator from '../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import AvatarMessageItem from '../common/components/ui/AvatarMessageItem.jsx';
import { chatService } from "./services/chatService.js";
import { useNotification } from '../notification/NotificationContext.jsx';
import { useQueryClient } from '@tanstack/react-query';

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
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

  // Filter chat rooms based on search term
  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      room.otherParticipantName?.toLowerCase().includes(searchLower) ||
      room.listingTitle?.toLowerCase().includes(searchLower) ||
      room.roomName?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

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
              <div className="bg-white rounded border border-gray-200 h-full flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                      <p className="text-sm text-gray-500 mt-1">{filteredChatRooms.length} active chats</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs font-medium text-gray-600">
                          {isConnected ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
                  {isLoadingRooms ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                        <p className="text-sm text-gray-500">Loading conversations...</p>
                      </div>
                  ) : chatRooms.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Start a conversation with a seller to see your messages here</p>
                        <button
                          onClick={() => window.location.href = '/listings'}
                          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          Browse Listings
                        </button>
                      </div>
                  ) : filteredChatRooms.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your search terms</p>
                      </div>
                  ) : (
                      filteredChatRooms.map((room) => (
                          <ChatRoomListItem
                              key={room.id}
                              room={room}
                              userId={user?.id}
                              isSelected={selectedChatRoom?.id === room.id}
                              onClick={() => handleChatRoomSelect(room)}
                              onListingClick={handleListingClick}
                              onDeleteConversation={handleDeleteConversation}
                          />
                      ))
                  )}
                </div>
              </div>
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

const ChatRoomListItem = ({ room, isSelected, onClick, onListingClick, userId, onDeleteConversation }) => {
  const [showOptions, setShowOptions] = useState(false);
  const unreadCount = room.unreadCount || 0;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteConversation(room.id);
    setShowOptions(false);
  };

  const getRoomTitle = () => {
    if (room.otherParticipantName) return room.otherParticipantName;
    if (room.listingTitle) return `Listing: ${room.listingTitle}`;
    return room.roomName;
  };

  const getRoomSubtitle = () => {
    if (room.roomType === 'LISTING' && room.otherParticipantName)
      return `Seller: ${room.otherParticipantName}`;
    if (room.roomType === 'DIRECT' && room.otherParticipantName) return 'Direct Message';
    return room.roomName;
  };

  const getLastMessageSenderName = () => {
    if (!room.lastMessageSenderId) return '';
    return room.lastMessageSenderId === userId
        ? 'You'
        : room.lastMessageSenderName || `User ${room.lastMessageSenderId}`;
  };

  return (
      <div className={`relative cursor-pointer transition-colors ${isSelected ? 'bg-gray-50 border-l-4 border-l-gray-900' : 'hover:bg-gray-50'}`}>
        <div className="flex justify-between items-start">
          <div onClick={onClick} className="flex-1 min-w-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start space-x-3 w-full">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {getRoomTitle().charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {room.listingTitle ? room.otherParticipantName : getRoomTitle()}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-900 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {room.lastMessageTime && new Date(room.lastMessageTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {room.listingTitle && (
                    <div className="mb-1">
                      <button
                        onClick={(e) => onListingClick && onListingClick(room.listingId, e)}
                        className="text-xs text-gray-600 hover:text-gray-900 hover:underline transition-colors break-words"
                        title={`View listing: ${room.listingTitle}`}
                      >
                        📦 {room.listingTitle.length > 25 ? `${room.listingTitle.substring(0, 25)}...` : room.listingTitle}
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 line-clamp-2 break-words">
                    {room.lastMessage ? (
                      <span>
                        <span className="font-medium">{getLastMessageSenderName()}:</span> {room.lastMessage}
                      </span>
                    ) : (
                      getRoomSubtitle()
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Options Button */}
          <div className="relative p-2">
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Options"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
            
            {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[140px]">
                  <button
                      onClick={handleDeleteClick}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete Chat</span>
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ChatPage;
