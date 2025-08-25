import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const AvatarMessageItem = ({
  avatarClassName = 'w-8 h-8 text-gray-400',
  containerClassName = '',
  isOwn = false,
  title,
  subtitle,
  content,
  createdAt,
  unread = false
}) => {
  return (
    <div className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${isOwn ? 'bg-blue-50' : ''} ${containerClassName}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <UserCircleIcon className={avatarClassName} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            {createdAt && (
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: tr })}
              </p>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
          {content && (
            <p className="text-sm text-gray-700 mt-1">{content}</p>
          )}
          {unread && !isOwn && (
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarMessageItem;



