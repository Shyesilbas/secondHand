import { useTranslation } from "react-i18next";
import React, { memo, useState, useRef, useLayoutEffect } from 'react';
import { Trash2 as TrashIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { sameChatId } from '../chatIdUtils.js';
const MessageBubble = memo(({
  message,
  isOwnMessage,
  onDeleteMessage
}) => {
  const { t } = useTranslation();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const handleDeleteClick = () => {
    onDeleteMessage(message.id);
  };
  return <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative group shadow-sm transition-all duration-300 ease-in-out ${isOwnMessage ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-background-primary text-slate-800 border border-border-light/60 rounded-bl-sm'}`} onMouseEnter={() => setShowDeleteButton(true)} onMouseLeave={() => setShowDeleteButton(false)}>
        <p className="text-sm break-words leading-relaxed tracking-tight">{message.content}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs tracking-tight ${isOwnMessage ? 'text-slate-300' : 'text-slate-500'}`}>
            {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: enUS
          })}
          </p>
          {isOwnMessage && <div className={`w-2 h-2 rounded-full ml-2 ${isOwnMessage ? 'bg-slate-300' : 'bg-text-muted'}`}></div>}
        </div>
        {isOwnMessage && showDeleteButton && onDeleteMessage && <button type="button" onClick={handleDeleteClick} className="absolute -top-2 -right-2 bg-status-error-bg text-white rounded-full p-1.5 hover:bg-status-error-bg transition-all duration-300 ease-in-out hover:shadow-lg transform hover:scale-110" title={t("delete_message")}>
            <TrashIcon className="w-3 h-3" />
          </button>}
      </div>
    </div>;
});
MessageBubble.displayName = 'MessageBubble';
const MessageList = memo(({
  messages,
  isLoadingMessages,
  messagesEndRef,
  messagesContainerRef,
  user,
  onDeleteMessage,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}) => {
  const { t } = useTranslation();
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    prevScrollTopRef.current = scrollTop;

    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      if (fetchNextPage) fetchNextPage();
    }
  };

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const currentScrollHeight = container.scrollHeight;
    
    if (prevScrollHeightRef.current > 0 && prevScrollHeightRef.current < currentScrollHeight) {
      if (prevScrollTopRef.current === 0) {
        container.scrollTop = currentScrollHeight - prevScrollHeightRef.current;
      }
    }
    
    prevScrollHeightRef.current = currentScrollHeight;
  }, [messages, isFetchingNextPage, messagesContainerRef]);

  return <div 
      ref={messagesContainerRef} 
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
        </div>
      )}
      {isLoadingMessages ? <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div> : messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-text-primary mb-1 tracking-tight">{t("no_messages_yet")}</h3>
          <p className="text-xs text-slate-500 tracking-tight">{t("send_the_first_message")}</p>
        </div> : messages.map(message => <MessageBubble key={message.id} message={message} isOwnMessage={sameChatId(message.senderId, user?.id)} onDeleteMessage={onDeleteMessage} />)}
      <div ref={messagesEndRef} />
    </div>;
});
MessageList.displayName = 'MessageList';
export default MessageList;