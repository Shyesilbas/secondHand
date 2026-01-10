import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Heart, Globe, Lock, MoreVertical, Pencil, Trash2, 
    Share2, Package, X, ExternalLink
} from 'lucide-react';
import { useFavoriteListById, useLikeFavoriteList, useUnlikeFavoriteList, useDeleteFavoriteList, useRemoveItemFromList } from '../hooks/useFavoriteLists.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteListModal from '../components/FavoriteListModal.jsx';

const FavoriteListDetailPage = () => {
    const { listId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data: list, isLoading, error } = useFavoriteListById(listId);
    const likeMutation = useLikeFavoriteList();
    const unlikeMutation = useUnlikeFavoriteList();
    const deleteMutation = useDeleteFavoriteList();
    const removeItemMutation = useRemoveItemFromList();

    const isOwner = user && list?.ownerId === user.id;
    const isLiked = list?.isLikedByCurrentUser;

    const handleLikeToggle = async () => {
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
                navigate(-1);
            } catch (error) {
                console.error('Error deleting list:', error);
            }
        }
        setShowMenu(false);
    };

    const handleRemoveItem = async (listingId) => {
        if (window.confirm('Bu ürünü listeden çıkarmak istediğinize emin misiniz?')) {
            try {
                await removeItemMutation.mutateAsync({ listId: list.id, listingId });
            } catch (error) {
                console.error('Error removing item:', error);
            }
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: list.name,
                    text: list.description || `${list.ownerName} tarafından oluşturuldu`,
                    url: url,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Link kopyalandı!');
        }
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="bg-white rounded-xl p-6 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl overflow-hidden">
                                    <div className="aspect-square bg-gray-200"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Liste Bulunamadı</h2>
                    <p className="text-gray-500 mb-6">Bu liste silinmiş veya size özel olabilir.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Geri</span>
                </button>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
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
                                
                                {list.description && (
                                    <p className="text-gray-600 mb-4">{list.description}</p>
                                )}

                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <Link 
                                        to={ROUTES.USER_PROFILE(list.ownerId)}
                                        className="hover:text-indigo-600 transition-colors"
                                    >
                                        {list.ownerName} tarafından
                                    </Link>
                                    <span>{list.itemCount} ürün</span>
                                    {list.isPublic && (
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {list.likeCount} beğeni
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Toplam Değer</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatPrice(list.totalPrice, list.currency)}
                                    </p>
                                </div>

                                {list.isPublic && !isOwner && user && (
                                    <button
                                        onClick={handleLikeToggle}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                            isLiked 
                                                ? 'bg-rose-500 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                )}

                                {list.isPublic && (
                                    <button
                                        onClick={handleShare}
                                        className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                )}

                                {isOwner && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        
                                        {showMenu && (
                                            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-10">
                                                <button
                                                    onClick={() => {
                                                        setShowEditModal(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Sil
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {list.items && list.items.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {list.items.map((item) => (
                            <div 
                                key={item.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all"
                            >
                                <div className="relative aspect-square bg-gray-100">
                                    {item.listingImageUrl ? (
                                        <img
                                            src={item.listingImageUrl}
                                            alt={item.listingTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                    
                                    {item.listingStatus !== 'ACTIVE' && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                                {item.listingStatus === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to={ROUTES.LISTING_DETAIL(item.listingId)}
                                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4 text-gray-600" />
                                        </Link>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveItem(item.listingId)}
                                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                                            >
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <Link to={ROUTES.LISTING_DETAIL(item.listingId)} className="block p-3">
                                    <h3 className="font-medium text-gray-900 text-sm truncate hover:text-indigo-600 transition-colors">
                                        {item.listingTitle}
                                    </h3>
                                    <p className="font-semibold text-gray-900 mt-1">
                                        {formatPrice(item.listingPrice, item.listingCurrency)}
                                    </p>
                                    {item.note && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            📝 {item.note}
                                        </p>
                                    )}
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Liste Boş</h3>
                        <p className="text-gray-500">
                            {isOwner 
                                ? 'Favori ürünlerinizi bu listeye ekleyin' 
                                : 'Bu listede henüz ürün yok'}
                        </p>
                    </div>
                )}
            </div>

            <FavoriteListModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                editList={list}
            />
        </div>
    );
};

export default FavoriteListDetailPage;

