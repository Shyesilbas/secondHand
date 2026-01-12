import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { MessageCircle, Search } from 'lucide-react';
import ChatRoomListItem from './ChatRoomListItem.jsx';

const ChatList = ({ 
  chatRooms, 
  isLoadingRooms, 
  selectedChatRoom, 
  userId, 
  isConnected,
  onChatRoomSelect,
  onListingClick,
  onDeleteConversation
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Conversations</h2>
            <p className="text-xs text-slate-500 mt-1 tracking-tight">{filteredChatRooms.length} active chats</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-100 rounded-full px-3 py-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              <span className="text-xs font-semibold text-slate-600 tracking-tight">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-11 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white transition-all duration-300 ease-in-out tracking-tight"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 transition-colors duration-300 ease-in-out group-focus-within:text-indigo-500" />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:bg-slate-50 rounded-r-xl transition-colors duration-300 ease-in-out"
            >
              <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {isLoadingRooms ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-sm text-slate-500 tracking-tight">Loading conversations...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <MessageCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">No Messages Yet</h3>
            <p className="text-sm text-slate-500 mb-5 tracking-tight">Start a conversation with a seller to see your messages here</p>
            <button
              onClick={() => window.location.href = '/listings'}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-300 ease-in-out text-sm font-semibold shadow-sm tracking-tight"
            >
              Browse Listings
            </button>
          </div>
        ) : filteredChatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">No conversations found</h3>
            <p className="text-sm text-slate-500 tracking-tight">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredChatRooms.map((room) => (
            <ChatRoomListItem
              key={room.id}
              room={room}
              userId={userId}
              isSelected={selectedChatRoom?.id === room.id}
              onClick={() => onChatRoomSelect(room)}
              onListingClick={onListingClick}
              onDeleteConversation={onDeleteConversation}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
