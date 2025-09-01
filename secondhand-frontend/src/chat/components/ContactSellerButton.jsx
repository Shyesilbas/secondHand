import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from './ChatWindow.jsx';

const ContactSellerButton = ({ listing, className = '' }) => {
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { createListingChat, selectChatRoom, sendMessage, messages, isLoadingMessages, isConnected, selectedChatRoom } = useChat(user?.id);

    // Kullanıcının kendi ilanı ise butonu gösterme
    if (listing.userId === user?.id) {
        return null;
    }

    const handleContactSeller = async () => {
        try {
            console.log('Creating listing chat for:', listing.id, listing.title || listing.name);
            // Listing chat'ini oluştur veya mevcut olanı al
            const chatRoom = await createListingChat(
                listing.id, 
                listing.title || listing.name || 'İlan'
            );
            
            console.log('Chat room created:', chatRoom);
            
            // Chat room'u seç ve chat'i aç
            selectChatRoom(chatRoom);
            setIsChatOpen(true);
        } catch (error) {
            console.error('Error creating listing chat:', error);
            // Hata durumunda kullanıcıya bilgi ver
            alert('Chat oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
    };

    return (
        <>
            <button
                onClick={handleContactSeller}
                className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${className}`}
            >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Satıcı ile İletişim
            </button>

            {isChatOpen && (
                <ChatWindow
                    isOpen={isChatOpen}
                    onClose={handleCloseChat}
                    selectedChatRoom={selectedChatRoom}
                    messages={messages}
                    onSendMessage={sendMessage}
                    isLoadingMessages={isLoadingMessages}
                    isConnected={isConnected}
                />
            )}
        </>
    );
};

export default ContactSellerButton;
