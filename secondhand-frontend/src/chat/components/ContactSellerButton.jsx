import React, { useState, useRef } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from './ChatWindow.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useLocation, useNavigate } from 'react-router-dom';

const ContactSellerButton = ({ listing, className = '', isDirectChat = false }) => {
    const { user, isAuthenticated } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const notification = useNotification();
    const location = useLocation();
    const navigate = useNavigate();
    const notificationShown = useRef(false);
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
        if (!isAuthenticated) {
            if (!notificationShown.current) {
                notificationShown.current = true;
                notification.addNotification({
                    type: 'info',
                    title: 'Authentication Required',
                    message: 'Please Log In',
                    autoClose: false,
                    showCloseButton: false,
                    actions: [
                        {
                            label: 'Cancel',
                            primary: false,
                            onClick: () => {
                                notificationShown.current = false;
                            }
                        },
                        {
                            label: 'OK',
                            primary: true,
                            onClick: () => {
                                navigate(ROUTES.LOGIN, { 
                                    state: { from: location },
                                    replace: true 
                                });
                                notificationShown.current = false;
                            }
                        }
                    ]
                });
            }
            return;
        }

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
            <button
                onClick={handleContactSeller}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors ${className}`}
                title="Contact Seller"
            >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Contact Seller
            </button>

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
