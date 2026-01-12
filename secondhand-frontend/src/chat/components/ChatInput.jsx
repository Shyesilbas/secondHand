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
      <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 flex-shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 ease-in-out tracking-tight"
              rows="1"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 ease-in-out tracking-tight"
            rows="1"
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          className="p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:shadow-lg"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
