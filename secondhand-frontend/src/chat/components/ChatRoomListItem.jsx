import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { EllipsisVertical as EllipsisVerticalIcon, Trash2 as TrashIcon } from 'lucide-react';
import { CHAT_ROOM_TYPES } from '../chatConstants.js';
import { sameChatId } from '../chatIdUtils.js';
const ChatRoomListItem = ({
 room,
 isSelected,
 onClick,
 onListingClick,
 userId,
 onDeleteConversation
}) => {
 const {
 t
 } = useTranslation();
 const [showOptions, setShowOptions] = useState(false);
 const unreadCount = room.unreadCount || 0;
 const handleDeleteClick = e => {
 e.stopPropagation();
 onDeleteConversation(room.id);
 setShowOptions(false);
 };
 const getRoomTitle = () => {
 if (room.otherParticipantName) return room.otherParticipantName;
 if (room.listingTitle) return room.listingTitle;
 if (room.roomName) return room.roomName;
 if (room.title) return room.title;
 return '';
 };
 const getRoomSubtitle = () => {
 if (room.roomType === CHAT_ROOM_TYPES.LISTING) return 'Listing Chat';
 if (room.roomType === CHAT_ROOM_TYPES.DIRECT) return 'Direct Message';
 return '';
 };
 const getLastMessageSenderName = () => {
 if (!room.lastMessageSenderId) return '';
 return sameChatId(room.lastMessageSenderId, userId) ? 'You' : room.lastMessageSenderName || `User ${room.lastMessageSenderId}`;
 };
 const title = getRoomTitle();
 return <div className={`relative cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? 'bg-background-tertiary/50 border-l-2 border-l-primary' : 'hover:bg-background-secondary/50'}`} onClick={onClick}>
 <div className="flex justify-between items-start">
 <div className="flex-1 min-w-0">
 <div className="p-4 border-b border-border-light/60">
 <div className="flex items-start space-x-3 w-full">
 <div className="flex-shrink-0">
 <div className="w-12 h-12 bg-secondary-700 rounded-md flex items-center justify-center">
 <span className="text-sm font-semibold text-white tracking-tight">
 {title ? title.charAt(0).toUpperCase() : '?'}
 </span>
 </div>
 </div>

 <div className="flex-1 min-w-0 pr-2">
 <div className="flex items-start justify-between mb-1.5">
 <div className="flex-1 min-w-0 mr-2">
 <h3 className={`text-sm font-medium text-text-primary truncate tracking-tight ${isSelected ? ' ' : ' '}`}>
 {title}
 </h3>
 </div>

 <div className="flex items-center space-x-2 flex-shrink-0">
 {unreadCount > 0 && <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold text-white bg-primary rounded-sm">
 {unreadCount > 99 ? '99+' : unreadCount}
 </span>}
 {room.lastMessageTime && <span className="text-xs text-text-tertiary whitespace-nowrap tracking-tight">
 {new Date(room.lastMessageTime).toLocaleDateString()}
 </span>}
 </div>
 </div>

 {room.listingId && onListingClick && <div className="mb-1.5">
 <button onClick={e => {
 e.stopPropagation();
 onListingClick(room.listingId, e);
 }} className="text-xs text-text-secondary hover:text-text-primary hover:underline transition-all duration-300 ease-in-out break-words tracking-tight">
 {room.listingTitle}
 </button>
 </div>}

 <p className={`text-xs line-clamp-2 break-words tracking-tight ${isSelected ? 'text-text-secondary' : 'text-text-tertiary'}`}>
 {room.lastMessage ? <span>
 <span className="font-semibold">
 {getLastMessageSenderName()}:
 </span>{' '}
 {room.lastMessage}
 </span> : getRoomSubtitle()}
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="relative p-2">
 <button onClick={e => {
 e.stopPropagation();
 setShowOptions(!showOptions);
 }} className="text-text-muted hover:text-text-secondary transition-all duration-300 ease-in-out p-1.5 rounded hover:bg-background-tertiary/50">
 <EllipsisVerticalIcon className="w-4 h-4" />
 </button>

 {showOptions && <div className="absolute right-0 top-full mt-1 bg-background-primary border border-border-light/60 rounded shadow-md z-10 min-w-36">
 <button onClick={handleDeleteClick} className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-status-error-text hover:bg-background-secondary transition-all duration-300 ease-in-out rounded mx-1 my-1 tracking-tight">
 <TrashIcon className="w-4 h-4" />
 <span>{t("delete_chat")}</span>
 </button>
 </div>}
 </div>
 </div>
 </div>;
};
export default ChatRoomListItem;