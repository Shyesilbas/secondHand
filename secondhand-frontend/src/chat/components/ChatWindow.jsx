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
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-sidebar-border flex flex-col z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
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
                                className="block text-xs opacity-90 hover:opacity-100 hover:underline cursor-pointer transition-all"
                                title="View listing"
                            >
                                {selectedChatRoom.listingTitle}
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
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-app-bg">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingIndicator size="h-8 w-8" />
                    </div>
                ) : messages.length === 0 ? (
                    <EmptyState title="No messages yet" description="Send the first message!" />
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
            <div className="p-4 border-t border-sidebar-border bg-white rounded-b-lg">
                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full px-3 py-2 border border-header-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="1"
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                    isOwnMessage
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-sidebar-border'
                }`}
                onMouseEnter={() => setShowDeleteButton(true)}
                onMouseLeave={() => setShowDeleteButton(false)}
            >
                <p className="text-sm break-words">{message.content}</p>
                <p
                    className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-text-muted'
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
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
