import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { chatService } from './services/chatService.js';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import LoadingIndicator from '../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import AvatarMessageItem from '../common/components/ui/AvatarMessageItem.jsx';
import Pagination from '../common/components/ui/Pagination.jsx';

const AllMessagesPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  // Tüm mesajları getir
  const {
    data: messagesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['allUserMessages', user?.id, page, size],
    queryFn: () => chatService.getAllUserMessages(user?.id, page, size),
    enabled: !!user?.id,
    refetchInterval: 10000 // 10 saniyede bir güncelle
  });

  // Toplam okunmamış mesaj sayısını getir
  const {
    data: totalUnreadCount = 0
  } = useQuery({
    queryKey: ['totalUnreadCount', user?.id],
    queryFn: () => chatService.getTotalUnreadMessageCount(user?.id),
    enabled: !!user?.id,
    refetchInterval: 30000 // 30 saniyede bir güncelle
  });

  const messages = messagesData?.content || [];
  const totalPages = messagesData?.totalPages || 0;
  const totalElements = messagesData?.totalElements || 0;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tüm Mesajlar</h2>
          <p className="text-gray-600">Mesajları görüntülemek için giriş yapın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tüm Mesajlar</h1>
          {totalUnreadCount > 0 && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {totalUnreadCount} okunmamış
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Mesajlar ({totalElements})
            </h2>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <LoadingIndicator />
              </div>
            ) : messages.length === 0 ? (
              <EmptyState icon={ChatBubbleLeftRightIcon} title="Henüz mesaj yok" description="Bir ilan hakkında satıcı ile iletişime geçin" />
            ) : (
              <div>
                {messages.map((message) => (
                  <AvatarMessageItem
                    key={message.id}
                    isOwn={message.senderId === user?.id}
                    title={message.senderId === user?.id ? 'Sen' : (message.senderName || `Kullanıcı ${message.senderId}`)}
                    content={message.content}
                    createdAt={message.createdAt}
                    unread={!message.isRead && message.senderId !== user?.id}
                  />
                ))}
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMessagesPage;
