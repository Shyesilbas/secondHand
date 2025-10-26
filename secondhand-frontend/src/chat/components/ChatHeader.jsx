import React, { useState } from 'react';
import { EllipsisVerticalIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';

const ChatHeader = ({ 
  selectedChatRoom, 
  isConnected, 
  onClose, 
  onDeleteConversation,
  onConversationDeleted 
}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [showOptions, setShowOptions] = useState(false);

  const handleListingTitleClick = () => {
    if (selectedChatRoom?.listingId) {
      navigate(`/listings/${selectedChatRoom.listingId}`);
      onClose();
    }
  };

  const handleUserClick = () => {
    if (selectedChatRoom?.otherParticipantId) {
      navigate(`/users/${selectedChatRoom.otherParticipantId}`);
      onClose();
    }
  };

  const handleDeleteConversation = () => {
    notification.showConfirmation(
      'Delete Conversation',
      'Are you sure you want to delete this conversation and all messages? This action cannot be undone.',
      () => {
        onDeleteConversation?.(selectedChatRoom.id);
        onConversationDeleted?.(selectedChatRoom.id);
        onClose();
        notification.showSuccess('Success', 'Conversation deleted successfully.');
      }
    );
    setShowOptions(false);
  };

  const getHeaderName = () => {
    if (selectedChatRoom?.otherParticipantName) {
      return selectedChatRoom.otherParticipantName;
    }
    if (selectedChatRoom?.roomType === 'LISTING') {
      return 'Seller';
    }
    return selectedChatRoom?.roomName || 'Chat';
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-900 text-white">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <div>
          <button
            onClick={handleUserClick}
            className="font-semibold text-sm hover:underline"
            title="View user profile"
          >
            {getHeaderName()}
          </button>
          {selectedChatRoom?.listingTitle && (
            <button
              onClick={handleListingTitleClick}
              className="block text-xs opacity-90 hover:opacity-100 hover:underline cursor-pointer transition-colors"
              title={`View listing: ${selectedChatRoom.listingTitle}`}
            >
              📦 {selectedChatRoom.listingTitle.length > 10 ? `${selectedChatRoom.listingTitle.substring(0, 10)}...` : selectedChatRoom.listingTitle}
            </button>
          )}
          <p className="text-xs opacity-90">
            {isConnected ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-white hover:text-gray-200 transition-colors p-1"
            title="Options"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[150px]">
              <button
                onClick={handleDeleteConversation}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
