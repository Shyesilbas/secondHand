import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from './ChatWindow.jsx';

const ContactSellerButton = ({ listing, className = '', isDirectChat = false }) => {
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const {
        createListingChat,
        createDirectChat,
        selectChatRoom,
        sendMessage,
        messages,
        isLoadingMessages,
        isConnected,
        selectedChatRoom
    } = useChat(user?.id);

    const targetUserId = listing.userId || listing.sellerId;
    if (targetUserId === user?.id) {
        return null;
    }

    const handleContactSeller = async () => {
        try {
            let chatRoom;
            if (isDirectChat) {
                chatRoom = await createDirectChat(targetUserId);
            } else {
                chatRoom = await createListingChat(
                    listing.id,
                    listing.title || listing.name || 'Listing'
                );
            }
            selectChatRoom(chatRoom);
            setIsChatOpen(true);
        } catch (error) {
            alert('An error occurred while starting the chat. Please try again later.');
        }
    };

    return (
        <>
            <ChatBubbleLeftRightIcon
                onClick={handleContactSeller}
                className={`w-6 h-6 cursor-pointer ${className}`}
                title="Contact Seller"
            />

            {isChatOpen && (
                <ChatWindow
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
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
