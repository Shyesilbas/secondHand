import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../../features/chat/services/chatService';
import { ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Henüz mesaj yok</p>
                <p className="text-sm">Bir ilan hakkında satıcı ile iletişime geçin</p>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === user?.id}
                  />
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <span className="text-sm text-gray-700">
                        Sayfa {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Item Component
const MessageItem = ({ message, isOwnMessage }) => {
  return (
    <div className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${isOwnMessage ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {isOwnMessage ? 'Sen' : message.senderName || `Kullanıcı ${message.senderId}`}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.createdAt), { 
                addSuffix: true, 
                locale: tr 
              })}
            </p>
          </div>
          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
          {!message.isRead && !isOwnMessage && (
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllMessagesPage;
