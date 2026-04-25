import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Search, Command, ArrowRight, CornerDownLeft, X} from 'lucide-react';
import {getAccountHubNavGroups} from '../../../../user/utils/accountHubSections.js';

/**
 * Spotlight-style in-app search.
 * Searches through all AccountHub navigation items by name/description.
 * Triggered by clicking the search trigger or pressing ⌘K / Ctrl+K.
 */
const HeaderSpotlight = ({userId, isOpen, onClose}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Build flat list of all navigable items
  const allItems = useMemo(() => {
    const groups = getAccountHubNavGroups(userId ?? 0);
    const items = [];
    for (const group of groups) {
      for (const item of group.items) {
        items.push({
          name: item.name,
          description: item.description,
          route: item.route,
          icon: item.icon,
          group: group.label,
        });
      }
    }
    return items;
  }, [userId]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8); // show top 8 when empty
    const q = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-spotlight-item]');
      items[selectedIndex]?.scrollIntoView({block: 'nearest'});
    }
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (item) => {
      if (!item?.route) return;
      onClose();
      navigate(item.route);
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
      return;
    }
  };

  if (!isOpen) return null;

  // Group filtered results by their group label
  const grouped = [];
  let lastGroup = null;
  for (const item of filteredItems) {
    if (item.group !== lastGroup) {
      grouped.push({type: 'header', label: item.group});
      lastGroup = item.group;
    }
    grouped.push({type: 'item', item});
  }

  let itemIndex = -1;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex justify-center pt-[15vh] px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search pages and features..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 font-medium">No results for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              grouped.map((entry, i) => {
                if (entry.type === 'header') {
                  return (
                    <div key={`h-${entry.label}`} className="px-4 pt-3 pb-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{entry.label}</span>
                    </div>
                  );
                }
                itemIndex++;
                const idx = itemIndex;
                const {item} = entry;
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.route}
                    data-spotlight-item
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                      isSelected ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/15' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                        {item.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="shrink-0">
                        <CornerDownLeft className="w-3.5 h-3.5 text-white/40" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hints */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center gap-4 text-[10px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white text-[9px] font-medium">↑↓</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white text-[9px] font-medium">↵</kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white text-[9px] font-medium">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSpotlight;
