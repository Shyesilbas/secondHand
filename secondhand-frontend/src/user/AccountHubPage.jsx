import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { getAccountHubSections } from './accountHubSections.js';
import { filterAccountHubSections } from './accountHubFilter.js';

const getInitials = (name) => {
  const value = (name || '').trim();
  if (!value) return 'U';
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'U';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};

const AccountHubPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allSections = useMemo(() => getAccountHubSections({ userId: user?.id }), [user?.id]);

  const filteredSections = useMemo(() => filterAccountHubSections(allSections, searchQuery), [allSections, searchQuery]);

  const flatItems = useMemo(
    () => allSections.flatMap((section) => section.items.map((item) => ({ ...item, sectionTitle: section.title }))),
    [allSections]
  );

  const totalItemsCount = flatItems.length;

  const visibleItemsCount = useMemo(
    () => filteredSections.reduce((acc, section) => acc + section.items.length, 0),
    [filteredSections]
  );

  const quickItems = useMemo(() => {
    const byTitle = new Map(flatItems.map((item) => [item.title, item]));
    const prioritizedTitles = ['Profile', 'My Listings', 'Create Listing', 'My Orders'];
    return prioritizedTitles.map((t) => byTitle.get(t)).filter(Boolean).slice(0, 4);
  }, [flatItems]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent" />
          <div className="relative p-6 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-semibold">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Account Hub</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Welcome back{user?.name ? `, ${user.name}` : ''}.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs text-slate-600">
                    <span>{searchQuery ? `${visibleItemsCount} of ${totalItemsCount}` : `${totalItemsCount}`}</span>
                    <span>destinations</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search your account..."
                    className="block w-full pl-9 pr-24 py-3 border border-slate-200 rounded-xl bg-white text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {quickItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {quickItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          to={item.route}
                          className="group rounded-xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition-colors">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 truncate">{item.title}</div>
                                <div className="text-xs text-slate-600 truncate">{item.desc}</div>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {filteredSections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <p className="text-slate-900 font-semibold">No results</p>
              <p className="text-sm text-slate-600 mt-1">Try a different search term.</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSections.map((section) => (
                <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {section.items.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`${section.title}:${item.title}`}
                          to={item.route}
                          className="group block rounded-xl border border-slate-200 bg-slate-50/40 p-4 hover:bg-white hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 border border-slate-200 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                  {item.title}
                                </h3>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountHubPage;
