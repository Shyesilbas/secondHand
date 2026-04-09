import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useListingActions } from '../hooks/useListingActions.js';
import { ListingQuickEdit } from './ListingQuickEdit.jsx';
import { LISTING_STATUS } from '../types/index.js';
import {
  MoreVertical, Pencil, CreditCard, PowerOff, Power,
  CheckCircle, Megaphone, Trash2, Zap,
} from 'lucide-react';

const ListingCardActions = ({ listing, onChanged }) => {
  const { user } = useAuthState();
  const { showSuccess, showError } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isInShowcase } = useShowcaseQueries();
  const dropdownRef = useRef(null);
  const actions = useListingActions({
    listing,
    onChanged,
    onCloseMenu: () => setIsDropdownOpen(false),
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOwner = user?.id === listing?.sellerId;
  if (!isOwner) return null;

  const listingInShowcase = isInShowcase(listing.id);
  const canEdit = listing.status !== LISTING_STATUS.SOLD;

  const MenuItem = ({ onClick, icon: Icon, label, variant = 'default' }) => {
    const colorMap = {
      default: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      green: 'text-emerald-700 hover:bg-emerald-50',
      indigo: 'text-indigo-700 hover:bg-indigo-50',
      amber: 'text-amber-700 hover:bg-amber-50',
      red: 'text-rose-600 hover:bg-rose-50',
    };
    return (
      <button
        onClick={onClick}
        className={`w-full px-3.5 py-2 text-left text-[12px] font-medium flex items-center gap-2.5 rounded-lg transition-colors ${colorMap[variant]}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">

          {/* Quick edit section */}
          {canEdit && (
            <div className="px-3 pb-2 mb-1 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-0.5">Quick Actions</p>
              <ListingQuickEdit
                listing={listing}
                onChanged={onChanged}
                showSuccess={showSuccess}
                showError={showError}
                compact
              />
            </div>
          )}

          <div className="px-1.5 space-y-0.5">
            {canEdit && (
              <MenuItem onClick={actions.handleEdit} icon={Pencil} label="Edit Listing" />
            )}

            {listing.status === LISTING_STATUS.DRAFT && (
              <MenuItem onClick={actions.handlePayListingFee} icon={CreditCard} label="Pay Listing Fee" variant="green" />
            )}

            {listing.status === LISTING_STATUS.ACTIVE && (
              <MenuItem onClick={actions.handleDeactivate} icon={PowerOff} label="Deactivate" />
            )}

            {listing.status === LISTING_STATUS.INACTIVE && (
              <MenuItem onClick={actions.handleReactivate} icon={Power} label="Reactivate" variant="green" />
            )}

            {listing.status !== LISTING_STATUS.SOLD && (
              <MenuItem onClick={actions.handleMarkAsSold} icon={CheckCircle} label="Mark as Sold" variant="amber" />
            )}

            {listing.status === LISTING_STATUS.ACTIVE && !listingInShowcase && (
              <MenuItem onClick={actions.handleOpenShowcase} icon={Zap} label="Add to Showcase" variant="indigo" />
            )}

            <MenuItem onClick={actions.handleOpenCampaign} icon={Megaphone} label="Create Campaign" variant="indigo" />
          </div>

          <div className="border-t border-slate-100 mt-2 pt-2 px-1.5">
            <MenuItem onClick={actions.handleDelete} icon={Trash2} label="Delete Listing" variant="red" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingCardActions;
