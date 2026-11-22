import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Search, X } from 'lucide-react';
import ChatRoomListItem from './ChatRoomListItem.jsx';
import { Badge, Button, EmptyState, Skeleton } from '../../common/components/ui/index.js';
import { inputNormal } from '../../common/components/forms/inputStyles.js';

const ChatListSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="divide-y divide-border-light" aria-busy="true" aria-label={t('loading_conversations', 'Sohbetler yükleniyor')}>
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex items-start gap-3 px-4 py-3.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ChatList = ({
  chatRooms,
  totalRooms,
  hasMoreRooms,
  isFetchingMoreRooms,
  onLoadMoreRooms,
  isLoadingRooms,
  selectedChatRoom,
  userId,
  isConnected,
  onChatRoomSelect,
  onBrowseListings,
  onDeleteConversation
}) => {
  const { t } = useTranslation();
  const searchId = useId();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChatRooms = chatRooms.filter((room) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      room.otherParticipantName?.toLowerCase().includes(searchLower) ||
      room.listingTitle?.toLowerCase().includes(searchLower) ||
      room.title?.toLowerCase().includes(searchLower) ||
      room.roomName?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  const activeCount = searchTerm.trim() ? filteredChatRooms.length : totalRooms ?? chatRooms.length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background-primary">
      <header className="shrink-0 border-b border-border-light px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-text-primary">
              {t('conversations', 'Sohbetler')}
            </h2>
            <p className="mt-0.5 text-sm tabular-nums text-text-tertiary">
              {activeCount} {t('active_chats', 'aktif sohbet')}
            </p>
          </div>
          <Badge variant={isConnected ? 'success' : 'neutral'} dot>
            {isConnected ? t('chat_online', 'Çevrimiçi') : t('chat_offline', 'Çevrimdışı')}
          </Badge>
        </div>

        <div className="relative mt-3.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t('search_conversations', 'Sohbetlerde ara')}
            placeholder={t('search_conversations', 'Sohbetlerde ara...')}
            className={`${inputNormal} h-9 bg-background-secondary pl-9 pr-8 focus:bg-background-primary`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label={t('clear_search', 'Aramayı temizle')}
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoadingRooms ? (
          <ChatListSkeleton />
        ) : chatRooms.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            size="compact"
            title={t('no_messages_yet', 'Henüz mesaj yok')}
            description={t('start_a_conversation_with_a_seller_to_se', 'Mesajlarınızı burada görmek için bir satıcıyla sohbet başlatın.')}
            primaryAction={
              onBrowseListings
                ? { label: t('browse_listings', 'İlanlara göz at'), onClick: onBrowseListings }
                : undefined
            }
            className="border-0 py-12"
          />
        ) : filteredChatRooms.length === 0 ? (
          <EmptyState
            icon={Search}
            size="compact"
            title={t('no_conversations_found', 'Sohbet bulunamadı')}
            description={t('try_adjusting_your_search_terms', 'Farklı bir arama terimi deneyin.')}
            primaryAction={{ label: t('clear_search', 'Aramayı temizle'), onClick: () => setSearchTerm('') }}
            className="border-0 py-12"
          />
        ) : (
          <ul className="divide-y divide-border-light">
            {filteredChatRooms.map((room) => (
              <ChatRoomListItem
                key={room.id}
                room={room}
                userId={userId}
                isSelected={selectedChatRoom?.id === room.id}
                onClick={() => onChatRoomSelect(room)}
                onDeleteConversation={onDeleteConversation}
              />
            ))}
          </ul>
        )}

        {!isLoadingRooms && hasMoreRooms && (
          <div className="flex justify-center border-t border-border-light px-4 py-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onLoadMoreRooms?.()}
              disabled={isFetchingMoreRooms}
            >
              {isFetchingMoreRooms
                ? t('loading_conversations', 'Yükleniyor...')
                : t('load_more_conversations', 'Daha fazla sohbet yükle')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
