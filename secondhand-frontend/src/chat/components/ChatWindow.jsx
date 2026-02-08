import React, {useEffect, useRef, useState} from 'react';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {useChatWindow} from '../hooks/useChatWindow.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import ChatInput from './ChatInput.jsx';

const ChatWindow = ({
                        isOpen,
                        onClose,
                        selectedChatRoom,
                        messages,
                        onSendMessage,
                        onDeleteMessage,
                        onDeleteConversation,
                        isLoadingMessages,
                        isConnected,
                        onConversationDeleted,
                        isEmbedded = false
                    }) => {
    const { user } = useAuthState();
    const notification = useNotification();
    const {
        messageText,
        setMessageText,
        messagesEndRef,
        inputRef,
        handleKeyPress,
        handleSendMessage,
        scrollToBottom
    } = useChatWindow({ selectedChatRoom, onSendMessage });

    const prevLenRef = useRef(messages?.length || 0);
    const messagesContainerRef = useRef(null);
    const prevChatRoomIdRef = useRef(selectedChatRoom?.id);

    useEffect(() => {
        const currentChatRoomId = selectedChatRoom?.id;
        const prevChatRoomId = prevChatRoomIdRef.current;
        
        if (currentChatRoomId !== prevChatRoomId) {
            prevChatRoomIdRef.current = currentChatRoomId;
            prevLenRef.current = 0;
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } else if (messages?.length > 0 && !isLoadingMessages) {
            const prev = prevLenRef.current;
            const curr = messages?.length || 0;
            if (prev === 0 || curr > prev) {
                setTimeout(() => {
                    scrollToBottom();
                }, 50);
                prevLenRef.current = curr;
            }
        }
    }, [messages, selectedChatRoom, scrollToBottom, isLoadingMessages]);

    const handleDeleteMessage = (messageId) => {
        onDeleteMessage?.(messageId);
        notification.showSuccess('Success', 'Message deleted successfully.');
    };

    if (!isOpen) return null;

    if (isEmbedded) {
        return (
            <div className="h-full min-h-0 flex flex-col overflow-hidden">
                <MessageList
                    messages={messages}
                    isLoadingMessages={isLoadingMessages}
                    messagesEndRef={messagesEndRef}
                    messagesContainerRef={messagesContainerRef}
                    user={user}
                    onDeleteMessage={handleDeleteMessage}
                />
                <ChatInput
                    messageText={messageText}
                    setMessageText={setMessageText}
                    handleKeyPress={handleKeyPress}
                    handleSendMessage={handleSendMessage}
                    inputRef={inputRef}
                    isEmbedded={true}
                />
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded border border-gray-200 flex flex-col z-50">
            <ChatHeader
                selectedChatRoom={selectedChatRoom}
                isConnected={isConnected}
                onClose={onClose}
                onDeleteConversation={onDeleteConversation}
                onConversationDeleted={onConversationDeleted}
            />
            <MessageList
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                messagesEndRef={messagesEndRef}
                messagesContainerRef={messagesContainerRef}
                user={user}
                onDeleteMessage={handleDeleteMessage}
            />
            <ChatInput
                messageText={messageText}
                setMessageText={setMessageText}
                handleKeyPress={handleKeyPress}
                handleSendMessage={handleSendMessage}
                inputRef={inputRef}
                isEmbedded={false}
            />
        </div>
    );
};

export default ChatWindow;
