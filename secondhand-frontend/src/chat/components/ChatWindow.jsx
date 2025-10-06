import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useChatWindow } from '../hooks/useChatWindow.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { chatService } from '../services/chatService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

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
                        onConversationDeleted
                    }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const [showOptions, setShowOptions] = useState(false);
    const {
        messageText,
        setMessageText,
        messagesEndRef,
        inputRef,
        handleKeyPress,
        handleSendMessage
    } = useChatWindow({ selectedChatRoom, onSendMessage });

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

    const handleDeleteMessage = (messageId) => {
        onDeleteMessage?.(messageId);
        notification.showSuccess('Success', 'Message deleted successfully.');
    };

        useEffect(() => {
        if (isOpen && selectedChatRoom?.id && messages.length > 0 && user?.id) {
            const timer = setTimeout(() => {
                chatService.markMessagesAsRead(selectedChatRoom.id, user.id)
                    .catch(error => console.error('Error marking messages as read:', error));
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [isOpen, selectedChatRoom?.id, messages.length, user?.id]);

    if (!isOpen) return null;

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
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded border border-gray-200 flex flex-col z-50">
            {/* Header */}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
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
                            onDeleteMessage={handleDeleteMessage}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
        </div>
    );
};

const MessageBubble = ({ message, isOwnMessage, onDeleteMessage }) => {
    const [showDeleteButton, setShowDeleteButton] = useState(false);

    const handleDeleteClick = () => {
        onDeleteMessage(message.id);
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded relative group ${
                    isOwnMessage
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                }`}
                onMouseEnter={() => setShowDeleteButton(true)}
                onMouseLeave={() => setShowDeleteButton(false)}
            >
                <p className="text-sm break-words">{message.content}</p>
                <p
                    className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-gray-300' : 'text-gray-500'
                    }`}
                >
                    {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: enUS
                    })}
                </p>
                {isOwnMessage && showDeleteButton && (
                    <button
                        onClick={handleDeleteClick}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        title="Delete message"
                    >
                        <TrashIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
