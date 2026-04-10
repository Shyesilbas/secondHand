import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Globe,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  Package,
  X,
  ExternalLink,
  StickyNote,
} from 'lucide-react';
import {
  useFavoriteListById,
  useLikeFavoriteList,
  useUnlikeFavoriteList,
  useDeleteFavoriteList,
  useRemoveItemFromList,
} from '../hooks/useFavoriteLists.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import FavoriteListModal from '../components/FavoriteListModal.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import logger from '../../common/utils/logger.js';
import { FAVORITE_LIST_LISTING_STATUS, FAVORITE_LIST_MESSAGES } from '../favoriteListConstants.js';

const FavoriteListDetailPage = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const notification = useNotification();

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
    } catch (err) {
      logger.error('Error toggling like:', err);
    }
  };

  const handleDelete = () => {
    notification.showConfirmation(
      FAVORITE_LIST_MESSAGES.DELETE_LIST_TITLE,
      FAVORITE_LIST_MESSAGES.DELETE_LIST_CONFIRM,
      async () => {
        try {
          await deleteMutation.mutateAsync(list.id);
          navigate(-1);
        } catch (err) {
          logger.error('Error deleting list:', err);
        }
      }
    );
    setShowMenu(false);
  };

  const handleRemoveItem = (listingId) => {
    notification.showConfirmation(
      FAVORITE_LIST_MESSAGES.REMOVE_ITEM_TITLE,
      FAVORITE_LIST_MESSAGES.REMOVE_ITEM_CONFIRM,
      async () => {
        try {
          await removeItemMutation.mutateAsync({ listId: list.id, listingId });
        } catch (err) {
          logger.error('Error removing item:', err);
        }
      }
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.name,
          text: list.description || `A list by ${list.ownerName}`,
          url,
        });
      } catch (err) {
        logger.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      notification.showSuccess(FAVORITE_LIST_MESSAGES.LINK_COPIED_TITLE, FAVORITE_LIST_MESSAGES.LINK_COPIED);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/90">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded-lg bg-slate-200" />
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-6 w-1/2 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="aspect-square bg-slate-200" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50/90 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{FAVORITE_LIST_MESSAGES.NOT_FOUND_TITLE}</h2>
          <p className="mt-2 text-sm text-slate-500">{FAVORITE_LIST_MESSAGES.NOT_FOUND_BODY}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {FAVORITE_LIST_MESSAGES.BACK}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/90">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/5">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{list.name}</h1>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      list.isPublic ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {list.isPublic ? (
                      <>
                        <Globe className="h-3 w-3" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Private
                      </>
                    )}
                  </div>
                </div>

                {list.description ? <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{list.description}</p> : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                  <Link
                    to={ROUTES.USER_PROFILE(list.ownerId)}
                    className="font-medium text-teal-800 transition hover:text-teal-950"
                  >
                    By {list.ownerName}
                  </Link>
                  <span>
                    {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  {list.isPublic ? (
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-4 w-4 text-rose-500" />
                      {list.likeCount} {list.likeCount === 1 ? 'like' : 'likes'}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total value</p>
                  <p className="font-mono text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
                    {formatCurrency(list.totalPrice, list.currency)}
                  </p>
                </div>

                {list.isPublic && !isOwner && user ? (
                  <button
                    type="button"
                    onClick={handleLikeToggle}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                      isLiked ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    aria-label={isLiked ? 'Unlike list' : 'Like list'}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                ) : null}

                {list.isPublic ? (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                    aria-label="Share list"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                ) : null}

                {isOwner ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                      aria-label="List actions"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {showMenu ? (
                      <div className="absolute right-0 top-full z-10 mt-2 min-w-[168px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditModal(true);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {list.items && list.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
            {list.items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-square bg-slate-100">
                  {item.listingImageUrl ? (
                    <img
                      src={item.listingImageUrl}
                      alt={item.listingTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-slate-300" />
                    </div>
                  )}

                  {item.listingStatus !== FAVORITE_LIST_LISTING_STATUS.ACTIVE ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                        {item.listingStatus === FAVORITE_LIST_LISTING_STATUS.SOLD
                          ? FAVORITE_LIST_MESSAGES.SOLD_LABEL
                          : FAVORITE_LIST_MESSAGES.INACTIVE_LABEL}
                      </span>
                    </div>
                  ) : null}

                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      to={ROUTES.LISTING_DETAIL(item.listingId)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-50"
                      aria-label="Open listing"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-600" />
                    </Link>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.listingId)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-red-50"
                        aria-label="Remove from list"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <Link to={ROUTES.LISTING_DETAIL(item.listingId)} className="block p-3">
                  <h3 className="truncate text-sm font-medium text-slate-900 transition hover:text-teal-800">
                    {item.listingTitle}
                  </h3>
                  <p className="mt-1 font-semibold tabular-nums text-slate-900">
                    {formatCurrency(item.listingPrice, item.listingCurrency)}
                  </p>
                  {item.note ? (
                    <p className="mt-1 flex items-start gap-1 truncate text-xs text-slate-500">
                      <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{item.note}</span>
                    </p>
                  ) : null}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">This list is empty</h3>
            <p className="mt-2 text-sm text-slate-500">
              {isOwner
                ? 'Add listings from search or listing pages with “Add to list”.'
                : 'There are no listings in this list yet.'}
            </p>
          </div>
        )}
      </div>

      <FavoriteListModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} editList={list} />
    </div>
  );
};

export default FavoriteListDetailPage;
