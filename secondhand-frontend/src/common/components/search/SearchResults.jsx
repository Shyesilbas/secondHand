import EmptyState from '../ui/EmptyState.jsx';
import {formatCurrency} from '../../formatters.js';
import {
  Search as MagnifyingGlassIcon,
  Compass,
  Inbox,
  PlusSquare,
  Sparkles,
  User,
  ChevronRight
} from 'lucide-react';

const SearchResults = ({ results, activeTab, selectedIndex, isLoading, query = "", onResultSelect }) => {

  const renderQuickLinks = () => {
    const quickLinks = [
      { label: 'Explore Categories', desc: 'Browse all vehicles, estates, and electronics', id: '/listings/prefilter', icon: Compass },
      { label: 'Start Selling', desc: 'Post a new item to the community', id: '/listings/prefilter?flow=create', icon: PlusSquare },
      { label: 'Account Hub & Settings', desc: 'Manage your profile and orders', id: '/dashboard', icon: User },
      { label: 'Aura AI Assistant', desc: 'Chat with our intelligent price expert', id: '/aura', icon: Sparkles },
      { label: 'Inbox & Messaging', desc: 'Check your messages and notifications', id: '/inbox', icon: Inbox }
    ];

    return (
      <div className="py-1">
        <div className="px-4 py-2 border-b border-gray-100/60 bg-gray-50/50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Navigation</span>
        </div>
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          const isSelected = index === selectedIndex;
          return (
            <div
              key={link.id}
              onClick={() => onResultSelect({ id: link.id, type: 'link' })}
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-left cursor-pointer transition-all duration-150 ${
                isSelected ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {link.label}
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/60' : 'text-slate-400 font-medium'}`}>
                  {link.desc}
                </div>
              </div>
              {isSelected && (
                <div className="shrink-0 animate-fade-in">
                  <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                </div>
              )}
            </div>
          );
        })}
        {/* Footer */}
        <div className="px-4 py-2.5 text-[10px] text-gray-400 font-medium bg-gray-50/55 border-t border-gray-100/60 flex items-center justify-between">
          <div>↑↓ Navigate • Enter Open • Esc Close</div>
          <div className="hidden sm:block">Ctrl+Tab Switch mode</div>
        </div>
      </div>
    );
  };

  const renderUserResult = (user, index) => (
    <div
      key={user.id}
      onClick={() => onResultSelect(user)}
      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
        index === selectedIndex ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-sm">
            {user.name} {user.surname}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListingResult = (listing, index) => (
    <div
      key={listing.id}
      onClick={() => onResultSelect(listing)}
      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
        index === selectedIndex ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate text-sm">
            {listing.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            #{listing.listingNo}
          </div>
          {listing.price && (
            <div className="text-sm font-semibold text-blue-600 mt-1">
              {formatCurrency(listing.price, listing.currency)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If query is empty or too short, render Quick Links
  if (query.trim().length < 2) {
    return renderQuickLinks();
  }

  if (results.length > 0) {
    return (
      <>
        {/* Tab Header */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 capitalize">
            {activeTab} Results
          </div>
          <div className="text-xs text-gray-500">
            {results.length} found
          </div>
        </div>

        {/* Results */}
        {results.map((result, index) => 
          activeTab === 'users' 
            ? renderUserResult(result, index)
            : renderListingResult(result, index)
        )}

        {/* Footer */}
        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t flex items-center justify-between">
          <div>↑↓ Navigate • Enter Select • Esc Close</div>
          <div>Ctrl+Tab Switch</div>
        </div>
      </>
    );
  }

  if (query.trim().length >= 2 && !isLoading) {
    return (
      <div className="p-4">
        <EmptyState
          icon={MagnifyingGlassIcon}
          title={`No ${activeTab} found`}
          description="Try different keywords"
          size="compact"
          className="border-0 shadow-none bg-transparent"
        />
      </div>
    );
  }

  return null;
};

export default SearchResults;
