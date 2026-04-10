import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {Globe, List, Lock, X} from 'lucide-react';
import {useCreateFavoriteList, useUpdateFavoriteList} from '../hooks/useFavoriteLists.js';
import logger from '../../common/utils/logger.js';
import { FAVORITE_LIST_MODAL_LIMITS } from '../favoriteListConstants.js';

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
            logger.error('Error saving list:', error);
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
            
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-950/5 animate-scaleIn">
                <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-800 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                <List className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {editList ? 'Edit List' : 'Create New List'}
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
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            List Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Home Decoration"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                            maxLength={FAVORITE_LIST_MODAL_LIMITS.NAME_MAX}
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="A short description about the list..."
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                            rows={3}
                            maxLength={FAVORITE_LIST_MODAL_LIMITS.DESCRIPTION_MAX}
                        />
                    </div>

                    <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">
                            Privacy
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublic: false })}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                                    !formData.isPublic
                                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span className="font-medium">Private</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublic: true })}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                                    formData.isPublic
                                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Globe className="w-4 h-4" />
                                <span className="font-medium">Public</span>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            {formData.isPublic 
                                ? 'Everyone can view and like this list'
                                : 'Only you can view this list'}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-medium text-white shadow-sm transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : (editList ? 'Update' : 'Create')}
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
