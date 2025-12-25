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
          className={`relative cursor-pointer transition-colors ${
              isSelected
                  ? 'bg-gray-50 border-l-4 border-l-gray-900'
                  : 'hover:bg-gray-50'
          }`}
          onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {title ? title.charAt(0).toUpperCase() : '?'}
                  </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {unreadCount > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-900 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                      )}
                      {room.lastMessageTime && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(room.lastMessageTime).toLocaleDateString()}
                      </span>
                      )}
                    </div>
                  </div>

                  {room.listingId && onListingClick && (
                      <div className="mb-1">
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onListingClick(room.listingId, e);
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 hover:underline transition-colors break-words"
                        >
                          📦 {room.listingTitle}
                        </button>
                      </div>
                  )}

                  <p className="text-xs text-gray-500 line-clamp-2 break-words">
                    {room.lastMessage ? (
                        <span>
                      <span className="font-medium">
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
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
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

export default ChatRoomListItem;
