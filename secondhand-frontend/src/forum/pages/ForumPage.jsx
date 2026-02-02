import React, {useMemo, useState} from 'react';
import {AlertTriangle, Clock, Flame, Lightbulb, MessageSquare, Search, ThumbsUp} from 'lucide-react';

const DAY_MS = 24 * 60 * 60 * 1000;

const CATEGORIES = [
  { id: 'hot', label: 'Sık Tartışılan', icon: Flame },
  { id: 'suggestions', label: 'Öneriler', icon: Lightbulb },
  { id: 'complaints', label: 'Şikayetler', icon: AlertTriangle },
];

const SORTS = [
  { id: 'hot', label: 'En popüler' },
  { id: 'new', label: 'En yeni' },
  { id: 'top', label: 'En çok oy alan' },
];

const ForumPage = () => {
  const [activeCategory, setActiveCategory] = useState('hot');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('hot');

  const now = useMemo(() => Date.now(), []);

  const formatRelative = (createdAtMs) => {
    const diff = Math.max(0, now - (createdAtMs || now));
    const mins = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / DAY_MS);
    if (days >= 7) return `${Math.floor(days / 7)} hafta önce`;
    if (days >= 1) return `${days} gün önce`;
    if (hours >= 1) return `${hours} saat önce`;
    return `${Math.max(1, mins)} dk önce`;
  };

  const posts = useMemo(() => ([
    {
      id: 'p1',
      category: 'hot',
      title: 'Kargo gecikmeleri için standart bir çözüm akışı oluşturalım mı?',
      excerpt: 'Alıcı-satıcı arasında kargo kaynaklı anlaşmazlıklar artıyor. Herkesin aynı yolu izlemesi için önerilerim var…',
      tags: ['shipping', 'policy', 'support'],
      author: 'serhat',
      createdAtMs: now - 2 * 60 * 60 * 1000,
      replies: 28,
      votes: 142,
    },
    {
      id: 'p2',
      category: 'suggestions',
      title: 'Listeleme oluştururken otomatik fiyat önerisi',
      excerpt: 'Benzer ilanlara göre fiyat aralığı önerisi çıkarıp kullanıcıya gösterebilir miyiz?',
      tags: ['pricing', 'ux', 'ai'],
      author: 'mert',
      createdAtMs: now - 10 * 60 * 60 * 1000,
      replies: 11,
      votes: 96,
    },
    {
      id: 'p3',
      category: 'complaints',
      title: 'Favoriler sayfası bazen boş geliyor',
      excerpt: 'Favorilere eklediğim ilanlar ara ara görünmüyor. Yenileyince geliyor. Bunu yaşayan var mı?',
      tags: ['favorites', 'bug', 'frontend'],
      author: 'ayse',
      createdAtMs: now - 3 * DAY_MS,
      replies: 7,
      votes: 34,
    },
    {
      id: 'p4',
      category: 'hot',
      title: 'Forumda etiket standartları belirleyelim',
      excerpt: 'Etiketler arama ve keşif için kritik. “bug”, “ux”, “policy” gibi bir standart set iyi olur.',
      tags: ['community', 'search'],
      author: 'elif',
      createdAtMs: now - 5 * DAY_MS,
      replies: 18,
      votes: 77,
    },
    {
      id: 'p5',
      category: 'suggestions',
      title: 'İlan düzenlemede “taslak kaydet” butonu',
      excerpt: 'Kullanıcılar edit sırasında kaybediyor. Edit flow’a taslak kaydet ekleyebilir miyiz?',
      tags: ['listing', 'draft', 'feature'],
      author: 'kemal',
      createdAtMs: now - 8 * DAY_MS,
      replies: 4,
      votes: 21,
    },
    {
      id: 'p6',
      category: 'complaints',
      title: 'Bildirimler gecikmeli geliyor',
      excerpt: 'Websocket bağlıyken bile bazen bildirim geç düşüyor. Özellikle offer tarafında.',
      tags: ['notifications', 'realtime'],
      author: 'zeynep',
      createdAtMs: now - 16 * DAY_MS,
      replies: 9,
      votes: 29,
    },
  ]), []);

  const filtered = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    let list = posts.filter((p) => p.category === activeCategory);
    if (q) {
      list = list.filter((p) => {
        const hay = `${p.title} ${p.excerpt} ${(p.tags || []).join(' ')}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (sort === 'new') {
      return [...list].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    }
    if (sort === 'top') {
      return [...list].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
    return [...list].sort((a, b) => (b.replies || 0) - (a.replies || 0));
  }, [activeCategory, posts, search, sort]);

  const hotTags = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
  }, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Forum</h1>
                <p className="mt-1 text-sm text-slate-600 tracking-tight">
                  Sık tartışılan konular, öneriler ve şikayetler tek yerde.
                </p>
                <p className="mt-1 text-sm text-slate-600 tracking-tight">
                  Burayı sürekli takip ederek sizlere daha iyi bir deneyim verebilmek için çalışıyoruz.
                </p>
              </div>
              <div className="w-full lg:max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Konularda ara..."
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ id, label, icon: Icon }) => {
                  const active = activeCategory === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveCategory(id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold tracking-tight border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 tracking-tight">Sırala</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-slate-900 font-semibold tracking-tight">Sonuç bulunamadı</p>
                <p className="text-sm text-slate-600 mt-1 tracking-tight">Aramayı değiştirip tekrar deneyin.</p>
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className={`relative overflow-hidden rounded-2xl border bg-white p-5 sm:p-6 transition-colors ${
                    (now - (p.createdAtMs || 0) <= DAY_MS) && (p.votes || 0) > 80
                      ? 'border-orange-300/70 hover:border-orange-400/80'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {(now - (p.createdAtMs || 0) <= DAY_MS) && (p.votes || 0) > 80 ? (
                    <>
                      <div className="absolute -inset-24 bg-gradient-to-r from-orange-500/25 via-rose-500/10 to-transparent blur-3xl animate-pulse" />
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-rose-500 to-transparent" />
                    </>
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 tracking-tight">
                          {CATEGORIES.find((c) => c.id === p.category)?.label || 'Konu'}
                        </span>
                        {(now - (p.createdAtMs || 0) <= DAY_MS) && (p.votes || 0) > 80 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-200 tracking-tight">
                            <Flame className="h-3.5 w-3.5 animate-pulse" />
                            Trending
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 tracking-tight">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelative(p.createdAtMs)}
                        </span>
                        <span className="text-xs text-slate-400 tracking-tight">by {p.author}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-slate-900 tracking-tight line-clamp-2">
                        {p.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 tracking-tight line-clamp-2">
                        {p.excerpt}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(p.tags || []).map((t) => (
                          <button
                            key={`${p.id}:${t}`}
                            type="button"
                            onClick={() => setSearch(t)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <ThumbsUp className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-bold text-slate-900">{p.votes}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <MessageSquare className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-bold text-slate-900">{p.replies}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Trend etiketler</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {hotTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSearch(t)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Yakında gelecek</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 tracking-tight">
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Gerçek zamanlı yorumlar ve canlı güncellenen sayaçlar</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Etiket önerileri ve moderasyon kuralları</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Şikayet akışı için kategorize formlar</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Profil rozetleri ve katkı puanı</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
