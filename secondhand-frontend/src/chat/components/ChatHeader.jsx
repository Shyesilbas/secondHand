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
    <div className="flex items-center justify-between p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md text-slate-900 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`}></div>
        <div>
          <button
            onClick={handleUserClick}
            className="font-bold text-base hover:text-slate-700 transition-all duration-300 ease-in-out tracking-tight"
            title="View user profile"
          >
            {getHeaderName()}
          </button>
          {selectedChatRoom?.listingTitle && (
            <button
              onClick={handleListingTitleClick}
              className="block text-xs text-slate-500 hover:text-slate-700 hover:underline cursor-pointer transition-all duration-300 ease-in-out mt-0.5 tracking-tight"
              title={`View listing: ${selectedChatRoom.listingTitle}`}
            >
              📦 {selectedChatRoom.listingTitle.length > 10 ? `${selectedChatRoom.listingTitle.substring(0, 10)}...` : selectedChatRoom.listingTitle}
            </button>
          )}
          <p className="text-xs font-medium text-slate-500 mt-1 tracking-tight">
            {isConnected ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300 ease-in-out p-2 rounded-xl"
            title="Options"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-2xl z-10 min-w-[150px]">
              <button
                onClick={handleDeleteConversation}
                className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-all duration-300 ease-in-out rounded-lg mx-1 my-1 tracking-tight"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300 ease-in-out p-2 rounded-xl"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
