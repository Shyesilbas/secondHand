import { useRef, useState, useCallback } from 'react';

export const useChatWindow = ({ selectedChatRoom, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = messagesEndRef.current;
    if (el) {
      const container = el.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      } else if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChatRoom?.id) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  return {
    messageText,
    setMessageText,
    messagesEndRef,
    inputRef,
    handleKeyPress,
    handleSendMessage,
    scrollToBottom
  };
};

export default useChatWindow;



