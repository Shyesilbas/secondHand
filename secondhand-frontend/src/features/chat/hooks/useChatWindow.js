import { useEffect, useRef, useState, useCallback } from 'react';

export const useChatWindow = ({ selectedChatRoom, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, selectedChatRoom]);

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



