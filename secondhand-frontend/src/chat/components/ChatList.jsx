import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import ChatRoomListItem from './ChatRoomListItem.jsx';
import { CHAT_MESSAGES } from '../chatConstants.js';
const ChatList = ({
 chatRooms,
 isLoadingRooms,
 selectedChatRoom,
 userId,
 isConnected,
 onChatRoomSelect,
 onListingClick,
 onBrowseListings,
 onDeleteConversation
}) => {
 const {
 t
 } = useTranslation();
 const [searchTerm, setSearchTerm] = useState('');
 const filteredChatRooms = chatRooms.filter(room => {
 if (!searchTerm) return true;
 const searchLower = searchTerm.toLowerCase();
 return room.otherParticipantName?.toLowerCase().includes(searchLower) || room.listingTitle?.toLowerCase().includes(searchLower) || room.title?.toLowerCase().includes(searchLower) || room.roomName?.toLowerCase().includes(searchLower) || room.lastMessage?.toLowerCase().includes(searchLower);
 });
 return <div className="bg-background-primary h-full flex flex-col overflow-hidden">
 <div className="px-6 py-5 border-b border-border-light/60 flex-shrink-0">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("conversations")}</h2>
 <p className="text-xs text-text-tertiary mt-1 tracking-tight">{filteredChatRooms.length}{t("active_chats")}</p>
 </div>
 <div className="flex items-center space-x-2">
 <div className="flex items-center space-x-1.5 bg-background-tertiary rounded px-3 py-1.5">
 <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-status-success' : 'bg-text-muted'}`}></div>
 <span className="text-xs font-semibold text-text-secondary tracking-tight">
 {isConnected ? CHAT_MESSAGES.ONLINE : CHAT_MESSAGES.OFFLINE}
 </span>
 </div>
 </div>
 </div>
 
 <div className="relative group">
 <input type="text" placeholder={t("search_conversations")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-11 text-sm border border-border-light rounded focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-background-primary transition-all duration-300 ease-in-out tracking-tight" />
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-text-muted transition-colors duration-300 ease-in-out group-focus-within:text-primary" />
 </div>
 {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:bg-background-secondary rounded-r transition-colors duration-300 ease-in-out">
 <svg className="h-4 w-4 text-text-muted hover:text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>}
 </div>
 </div>

 <div className="flex-1 overflow-y-auto min-h-0">
 {isLoadingRooms ? <div className="p-4" aria-busy="true" aria-label={t("loading_conversations")}>
 <SkeletonList />
 </div> : chatRooms.length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-center px-6">
 <MessageCircle className="mb-5 h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
 <h3 className="text-sm font-medium text-text-primary mb-2 tracking-tight">{t("no_messages_yet")}</h3>
 <p className="text-sm text-text-tertiary mb-5 tracking-tight">{t("start_a_conversation_with_a_seller_to_se")}</p>
 <button onClick={() => onBrowseListings?.()} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">
 {CHAT_MESSAGES.BROWSE_LISTINGS}
 </button>
 </div> : filteredChatRooms.length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-center px-6">
 <Search className="mb-5 h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
 <h3 className="text-sm font-medium text-text-primary mb-2 tracking-tight">{t("no_conversations_found")}</h3>
 <p className="text-sm text-text-tertiary tracking-tight">{t("try_adjusting_your_search_terms")}</p>
 </div> : filteredChatRooms.map(room => <ChatRoomListItem key={room.id} room={room} userId={userId} isSelected={selectedChatRoom?.id === room.id} onClick={() => onChatRoomSelect(room)} onListingClick={onListingClick} onDeleteConversation={onDeleteConversation} />)}
 </div>
 </div>;
};
export default ChatList;