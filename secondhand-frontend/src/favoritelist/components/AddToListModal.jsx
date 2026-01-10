import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, List, Loader2, Globe, Lock, Package } from 'lucide-react';
import { useMyFavoriteLists, useAddItemToList, useRemoveItemFromList, useListsContainingListing } from '../hooks/useFavoriteLists.js';
import FavoriteListModal from './FavoriteListModal.jsx';

const AddToListModal = ({ isOpen, onClose, listingId, listingTitle }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const { data: myLists = [], isLoading: listsLoading, refetch } = useMyFavoriteLists();
    const { data: containingData, refetch: refetchContaining } = useListsContainingListing(listingId);
    const containingListIds = containingData?.listIds || [];
    
    const addMutation = useAddItemToList();
    const removeMutation = useRemoveItemFromList();

    useEffect(() => {
        if (isOpen) {
            refetch();
            refetchContaining();
        }
    }, [isOpen, refetch, refetchContaining]);

    useEffect(() => {
        if (showCreateModal && !isOpen) {
            setShowCreateModal(false);
        }
    }, [isOpen, showCreateModal]);

    const handleToggleList = async (listId) => {
        const isInList = containingListIds.includes(listId);
        
        try {
            if (isInList) {
                await removeMutation.mutateAsync({ listId, listingId });
            } else {
                await addMutation.mutateAsync({ listId, listingId });
            }
        } catch (error) {
            console.error('Error toggling list:', error);
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        refetch();
    };

    if (!isOpen) return null;

    const modalContent = (
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={onClose}
                />
                
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                    <List className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        Listeye Ekle
                                    </h2>
                                    <p className="text-white/90 text-sm line-clamp-2 leading-snug">
                                        {listingTitle}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                                aria-label="Kapat"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {listsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                                <p className="text-sm text-gray-500">Listeler yükleniyor...</p>
                            </div>
                        ) : myLists.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <List className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Henüz listen yok
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Ürünleri kategorize etmek için ilk listeni oluştur
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="w-5 h-5" />
                                    İlk Listeni Oluştur
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700 mb-4">
                                    Listelerim ({myLists.length})
                                </p>
                                {myLists.map((list) => {
                                    const isInList = containingListIds.includes(list.id);
                                    const isProcessing = (addMutation.isPending || removeMutation.isPending) && 
                                        (addMutation.variables?.listId === list.id || removeMutation.variables?.listId === list.id);
                                    
                                    return (
                                        <button
                                            type="button"
                                            key={list.id}
                                            onClick={() => handleToggleList(list.id)}
                                            disabled={isProcessing}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all group ${
                                                isInList
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            } ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                                isInList 
                                                    ? 'bg-indigo-500 shadow-md' 
                                                    : 'bg-gray-100 group-hover:bg-indigo-100'
                                            }`}>
                                                {isProcessing ? (
                                                    <Loader2 className={`w-6 h-6 animate-spin ${isInList ? 'text-white' : 'text-indigo-500'}`} />
                                                ) : isInList ? (
                                                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                                                ) : (
                                                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className={`font-semibold truncate ${isInList ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                        {list.name}
                                                    </p>
                                                    {list.isPublic ? (
                                                        <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    ) : (
                                                        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Package className="w-3.5 h-3.5" />
                                                        {list.itemCount || 0} ürün
                                                    </span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{list.isPublic ? 'Herkese Açık' : 'Gizli'}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {myLists.length > 0 && (
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Yeni Liste Oluştur
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <FavoriteListModal
                    isOpen={showCreateModal}
                    onClose={handleCreateSuccess}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </>
    );

    return createPortal(modalContent, document.body);
};

export default AddToListModal;

