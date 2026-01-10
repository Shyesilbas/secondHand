import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Lock, List } from 'lucide-react';
import { useCreateFavoriteList, useUpdateFavoriteList } from '../hooks/useFavoriteLists.js';

const FavoriteListModal = ({ isOpen, onClose, editList = null, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: false,
    });

    const createMutation = useCreateFavoriteList();
    const updateMutation = useUpdateFavoriteList();

    useEffect(() => {
        if (editList) {
            setFormData({
                name: editList.name || '',
                description: editList.description || '',
                isPublic: editList.isPublic || false,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                isPublic: false,
            });
        }
    }, [editList, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editList) {
                await updateMutation.mutateAsync({
                    listId: editList.id,
                    data: formData,
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving list:', error);
        }
    };

    if (!isOpen) return null;

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <List className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {editList ? 'Listeyi Düzenle' : 'Yeni Liste Oluştur'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Liste Adı
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Örn: Ev Dekorasyonu"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                            maxLength={100}
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama (Opsiyonel)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Liste hakkında kısa bir açıklama..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none outline-none"
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Gizlilik
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublic: false })}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                    !formData.isPublic
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span className="font-medium">Gizli</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublic: true })}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                    formData.isPublic
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <Globe className="w-4 h-4" />
                                <span className="font-medium">Herkese Açık</span>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {formData.isPublic 
                                ? 'Herkes bu listeyi görebilir ve beğenebilir'
                                : 'Sadece sen bu listeyi görebilirsin'}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Kaydediliyor...' : (editList ? 'Güncelle' : 'Oluştur')}
                        </button>
                    </div>
                </form>
            </div>
            
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
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default FavoriteListModal;

