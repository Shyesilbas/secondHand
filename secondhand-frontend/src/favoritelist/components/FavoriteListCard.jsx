import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Lock, MoreVertical, Pencil, Trash2, Package } from 'lucide-react';
import { useLikeFavoriteList, useUnlikeFavoriteList, useDeleteFavoriteList } from '../hooks/useFavoriteLists.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import FavoriteListModal from './FavoriteListModal.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import logger from '../../common/utils/logger.js';
import { FAVORITE_LIST_MESSAGES } from '../favoriteListConstants.js';
const FavoriteListCard = ({
  list,
  showOwner = false
}) => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthState();
  const notification = useNotification();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const likeMutation = useLikeFavoriteList();
  const unlikeMutation = useUnlikeFavoriteList();
  const deleteMutation = useDeleteFavoriteList();
  const isOwner = user && list.ownerId === user.id;
  const isLiked = list.isLikedByCurrentUser;
  const handleLikeToggle = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync(list.id);
      } else {
        await likeMutation.mutateAsync(list.id);
      }
    } catch (error) {
      logger.error('Error toggling like:', error);
    }
  };
  const handleDelete = () => {
    notification.showConfirmation(FAVORITE_LIST_MESSAGES.DELETE_LIST_TITLE, FAVORITE_LIST_MESSAGES.DELETE_LIST_CONFIRM, async () => {
      try {
        await deleteMutation.mutateAsync(list.id);
      } catch (error) {
        logger.error('Error deleting list:', error);
      }
    });
    setShowMenu(false);
  };
  return <>
            <Link to={ROUTES.FAVORITE_LIST_DETAIL(list.id)} className="block group">
                <div className="bg-background-primary rounded-2xl border border-border-light overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                        {list.previewImageUrl || list.coverImageUrl ? <img src={list.previewImageUrl || list.coverImageUrl} alt={list.name} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-300" />
                            </div>}
                        
                        <div className="absolute top-3 left-3">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${list.isPublic ? 'bg-status-success-bg text-green-700' : 'bg-tertiary text-text-secondary'}`}>
                                {list.isPublic ? <>
                                        <Globe className="w-3 h-3" />{t("public")}</> : <>
                                        <Lock className="w-3 h-3" />{t("private")}</>}
                            </div>
                        </div>

                        {isOwner && <div className="absolute top-3 right-3">
                                <button onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }} className="w-8 h-8 bg-background-primary/90 rounded-full flex items-center justify-center hover:bg-background-primary transition-colors shadow-sm">
                                    <MoreVertical className="w-4 h-4 text-text-secondary" />
                                </button>
                                
                                {showMenu && <div className="absolute top-full right-0 mt-1 bg-background-primary rounded-lg shadow-lg border border-border-light py-1 min-w-[140px] z-10" onClick={e => e.stopPropagation()}>
                                        <button onClick={e => {
                e.preventDefault();
                setShowEditModal(true);
                setShowMenu(false);
              }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-secondary">
                                            <Pencil className="w-4 h-4" />{t("edit")}</button>
                                        <button onClick={e => {
                e.preventDefault();
                handleDelete();
              }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-status-error hover:bg-status-error-bg">
                                            <Trash2 className="w-4 h-4" />{t("delete")}</button>
                                    </div>}
                            </div>}

                        {list.isPublic && !isOwner && user && <button onClick={handleLikeToggle} className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isLiked ? 'bg-rose-500 text-white' : 'bg-background-primary/90 text-text-secondary hover:bg-background-primary'}`}>
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>}
                    </div>

                    <div className="p-4">
                        <h3 className="text-sm font-medium text-text-primary group- transition-colors truncate">
                            {list.name}
                        </h3>
                        
                        {list.description && <p className="text-sm text-text-muted mt-1 line-clamp-2">
                                {list.description}
                            </p>}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-sm text-text-muted">
                                <span>
                                    {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
                                </span>
                                {list.isPublic && <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {list.likeCount}
                                    </span>}
                            </div>
                            <span className="font-semibold text-text-primary">
                                {formatCurrency(list.totalPrice, list.currency)}
                            </span>
                        </div>

                        {showOwner && <div className="mt-3 text-xs text-text-muted">{t("by")}{list.ownerName}
                            </div>}
                    </div>
                </div>
            </Link>

            <FavoriteListModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} editList={list} />
        </>;
};
export default FavoriteListCard;