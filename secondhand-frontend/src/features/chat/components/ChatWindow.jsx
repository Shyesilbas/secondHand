import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const ChatWindow = ({ 
    isOpen, 
    onClose, 
    selectedChatRoom, 
    messages, 
    onSendMessage, 
    isLoadingMessages,
    isConnected 
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Mesajları otomatik scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Enter tuşu ile mesaj gönderme
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        console.log('Sending message:', messageText);
        console.log('Selected chat room:', selectedChatRoom);
        console.log('Selected chat room id:', selectedChatRoom?.id);
        if (messageText.trim() && selectedChatRoom?.id) {
            onSendMessage(messageText.trim());
            setMessageText('');
        } else {
            console.log('Cannot send message - missing text or chat room');
            console.log('Message text:', messageText.trim());
            console.log('Selected chat room exists:', !!selectedChatRoom);
            console.log('Selected chat room id exists:', !!selectedChatRoom?.id);
        }
    };

    const handleListingTitleClick = () => {
        if (selectedChatRoom?.listingId) {
            // İlan detay sayfasına yönlendir
            navigate(`/listings/${selectedChatRoom.listingId}`);
            // Chat'i kapat
            onClose();
        }
    };

    if (!isOpen) return null;

    const getHeaderName = () => {
        if (selectedChatRoom?.otherParticipantName) {
            return selectedChatRoom.otherParticipantName;
        }

        if (selectedChatRoom?.roomType === 'LISTING') {
            return 'Satıcı';
        }

        return selectedChatRoom?.roomName || 'Chat';
    };



    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div>
                        <h3 className="font-semibold text-sm">
                            {getHeaderName()}
                        </h3>
                        {selectedChatRoom?.listingTitle && (
                            <button
                                onClick={handleListingTitleClick}
                                className="text-xs opacity-90 hover:opacity-100 hover:underline cursor-pointer transition-all"
                                title="İlanı görüntüle"
                            >
                                {selectedChatRoom.listingTitle}
                            </button>
                        )}
                        <p className="text-xs opacity-90">
                            {isConnected ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>Henüz mesaj yok</p>
                        <p className="text-sm">İlk mesajı siz gönderin!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwnMessage={message.senderId === user?.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Mesajınızı yazın..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="1"
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const MessageBubble = ({ message, isOwnMessage }) => {
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}
            >
                <p className="text-sm break-words">{message.content}</p>
                <p
                    className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                >
                    {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: tr
                    })}
                </p>
            </div>
        </div>
    );
};

export default ChatWindow;
