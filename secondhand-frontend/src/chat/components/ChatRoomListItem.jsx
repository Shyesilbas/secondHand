import React, {useState} from 'react';
import {EllipsisVerticalIcon, TrashIcon} from '@heroicons/react/24/outline';

const ChatRoomListItem = ({
                            room,
                            isSelected,
                            onClick,
                            onListingClick,
                            userId,
                            onDeleteConversation
                          }) => {
  const [showOptions, setShowOptions] = useState(false);
  const unreadCount = room.unreadCount || 0;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteConversation(room.id);
    setShowOptions(false);
  };

  const getRoomTitle = () => {
    if (room.otherParticipantName) return room.otherParticipantName;
    if (room.listingTitle) return room.listingTitle;
    if (room.roomName) return room.roomName;
    if (room.title) return room.title;
    return '';
  };

  const getRoomSubtitle = () => {
    if (room.roomType === 'LISTING') return 'Listing Chat';
    if (room.roomType === 'DIRECT') return 'Direct Message';
    return '';
  };

  const getLastMessageSenderName = () => {
    if (!room.lastMessageSenderId) return '';
    return room.lastMessageSenderId === userId
        ? 'You'
        : room.lastMessageSenderName || `User ${room.lastMessageSenderId}`;
  };

  const title = getRoomTitle();

  return (
      <div
          className={`relative cursor-pointer transition-all duration-300 ease-in-out ${
              isSelected
                  ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600'
                  : 'hover:bg-slate-50/50'
          }`}
          onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-100/60">
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {title ? title.charAt(0).toUpperCase() : '?'}
                  </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className={`text-sm truncate tracking-tight ${
                        isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'
                      }`}>
                        {title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {unreadCount > 0 && (
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-indigo-600 rounded-full shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                      )}
                      {room.lastMessageTime && (
                          <span className="text-xs text-slate-500 whitespace-nowrap tracking-tight">
                        {new Date(room.lastMessageTime).toLocaleDateString()}
                      </span>
                      )}
                    </div>
                  </div>

                  {room.listingId && onListingClick && (
                      <div className="mb-1.5">
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onListingClick(room.listingId, e);
                            }}
                            className="text-xs text-slate-600 hover:text-slate-900 hover:underline transition-all duration-300 ease-in-out break-words tracking-tight"
                        >
                          📦 {room.listingTitle}
                        </button>
                      </div>
                  )}

                  <p className={`text-xs line-clamp-2 break-words tracking-tight ${
                    isSelected ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    {room.lastMessage ? (
                        <span>
                      <span className="font-semibold">
                        {getLastMessageSenderName()}:
                      </span>{' '}
                          {room.lastMessage}
                    </span>
                    ) : (
                        getRoomSubtitle()
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-2">
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className="text-slate-400 hover:text-slate-600 transition-all duration-300 ease-in-out p-1.5 rounded-xl hover:bg-slate-100/50"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>

            {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-2xl z-10 min-w-[140px]">
                  <button
                      onClick={handleDeleteClick}
                      className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-all duration-300 ease-in-out rounded-lg mx-1 my-1 tracking-tight"
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

export default ChatRoomListItem;
