import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

const MessageBubble = ({ message, isOwnMessage, onDeleteMessage }) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleDeleteClick = () => {
    onDeleteMessage(message.id);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative group shadow-sm ${
          isOwnMessage
            ? 'bg-gray-900 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
        }`}
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
      >
        <p className="text-sm break-words leading-relaxed">{message.content}</p>
        <div className="flex items-center justify-between mt-2">
          <p
            className={`text-xs ${
              isOwnMessage ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: enUS
            })}
          </p>
          {isOwnMessage && (
            <div className={`w-2 h-2 rounded-full ml-2 ${isOwnMessage ? 'bg-gray-300' : 'bg-gray-400'}`}></div>
          )}
        </div>
        {isOwnMessage && showDeleteButton && (
          <button
            onClick={handleDeleteClick}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-all duration-200 hover:shadow-lg transform hover:scale-110"
            title="Delete message"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

const MessageList = ({ 
  messages, 
  isLoadingMessages, 
  messagesEndRef, 
  messagesContainerRef,
  user,
  onDeleteMessage 
}) => {
  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-full">
      {isLoadingMessages ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No messages yet</h3>
          <p className="text-xs text-gray-500">Send the first message!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === user?.id}
            onDeleteMessage={onDeleteMessage}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
