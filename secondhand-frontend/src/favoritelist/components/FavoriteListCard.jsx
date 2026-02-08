import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Lock, MoreVertical, Pencil, Trash2, Package } from 'lucide-react';
import { useLikeFavoriteList, useUnlikeFavoriteList, useDeleteFavoriteList } from '../hooks/useFavoriteLists.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteListModal from './FavoriteListModal.jsx';

const FavoriteListCard = ({ list, showOwner = false }) => {
    const { user } = useAuthState();
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const likeMutation = useLikeFavoriteList();
    const unlikeMutation = useUnlikeFavoriteList();
    const deleteMutation = useDeleteFavoriteList();

    const isOwner = user && list.ownerId === user.id;
    const isLiked = list.isLikedByCurrentUser;

    const handleLikeToggle = async (e) => {
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
            console.error('Error toggling like:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bu listeyi silmek istediğinize emin misiniz?')) {
            try {
                await deleteMutation.mutateAsync(list.id);
            } catch (error) {
                console.error('Error deleting list:', error);
            }
        }
        setShowMenu(false);
    };

    const formatPrice = (price, currency) => {
        if (!price) return '₺0';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency || 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <>
            <Link 
                to={ROUTES.FAVORITE_LIST_DETAIL(list.id)}
                className="block group"
            >
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                        {list.previewImageUrl || list.coverImageUrl ? (
                            <img
                                src={list.previewImageUrl || list.coverImageUrl}
                                alt={list.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-300" />
                            </div>
                        )}
                        
                        <div className="absolute top-3 left-3">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                list.isPublic 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}>
                                {list.isPublic ? (
                                    <>
                                        <Globe className="w-3 h-3" />
                                        Herkese Açık
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3 h-3" />
                                        Gizli
                                    </>
                                )}
                            </div>
                        </div>

                        {isOwner && (
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowMenu(!showMenu);
                                    }}
                                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                                
                                {showMenu && (
                                    <div 
                                        className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setShowEditModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete();
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Sil
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {list.isPublic && !isOwner && user && (
                            <button
                                onClick={handleLikeToggle}
                                className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                    isLiked 
                                        ? 'bg-rose-500 text-white' 
                                        : 'bg-white/90 text-gray-600 hover:bg-white'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>

                    <div className="p-4">
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {list.name}
                        </h3>
                        
                        {list.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {list.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{list.itemCount} ürün</span>
                                {list.isPublic && (
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {list.likeCount}
                                    </span>
                                )}
                            </div>
                            <span className="font-semibold text-gray-900">
                                {formatPrice(list.totalPrice, list.currency)}
                            </span>
                        </div>

                        {showOwner && (
                            <div className="mt-3 text-xs text-gray-500">
                                {list.ownerName} tarafından
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <FavoriteListModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                editList={list}
            />
        </>
    );
};

export default FavoriteListCard;

