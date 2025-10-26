import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const ChatInput = ({ 
  messageText, 
  setMessageText, 
  handleKeyPress, 
  handleSendMessage, 
  inputRef,
  isEmbedded = false 
}) => {
  if (isEmbedded) {
    return (
      <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              rows="1"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            rows="1"
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          className="p-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
