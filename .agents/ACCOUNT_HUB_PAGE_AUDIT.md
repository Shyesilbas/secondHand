# Account Hub Page Tasarım Audit
_Tarih: 2026-06-21_

## Genel Yapı
AccountHubPage sayfası (Dashboard), masaüstünde yan menü ve ana içerik paneliyle (grid tabanlı) ve mobilde üst sekme barıyla kurgulanmış modern bir arayüze sahip. Ancak arka plan renkleri, hover efektleri, border'lar ve gradient bileşenlerinde token standartlarından sapılmış. "Hardcoded" değerlerin (arbitrary class'lar) yoğun kullanıldığı bir dosya.

## Component Haritası
- `AccountHubPage` (Sayfanın tamamı tek dosyada)
  - Sidebar (Sol menü)
  - Mobile Horizontal Navigation
  - Header Panel (Welcome & Trust Badge)
  - Mini Summary Row (Listings, Saved, Inbox)
  - Recent Orders Box
  - Quick Actions Panel (Create Listing, E-Wallet, Addresses)
  - `MyShowcasesPanel` (Alt komponent)

## Tespit Edilen Tasarım Sorunları

| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| Arbitrary Hex Background (`bg-[#faf9f7]`) | `AccountHubPage.jsx` Satır 61, 65 | Yüksek | Tema standardı olan `bg-background-secondary` token'ı kullanılmalı. |
| Yasaklı Gradient Kullanımı (`bg-gradient-to-br from-indigo-500 to-violet-600`) | Satır 70 (Kullanıcı Avatarı) | Yüksek | `bg-primary` gibi solid bir token'a geçirilmeli. |
| Arbitrary Opacity / Kenarlıklar (`border-slate-100/60`, vb.) | Birden fazla yer (Örn: 69, 139, 157, 181) | Orta | `border-border-light` gibi şeffaflık içermeyen sabit token'lar kullanılmalı. |
| Arbitrary Background Opacity (`hover:bg-slate-950/[0.02]`) | Satır 100, 109 | Orta | Solid hover token'ları (`hover:bg-secondary-light`) tercih edilmeli. |
| Hardcoded Tailwind Renkleri (`bg-slate-900`, `text-emerald-700`, `text-rose-500`, `text-teal-500`) | Aktif menü, status badge ve ikonlarda | Yüksek | `bg-primary`, `text-status-success`, `text-status-error` gibi semantic tema değişkenleri kullanılmalı. |
| Opacity Status Badge (`bg-status-success-bg/50`) | Satır 131, 180 | Düşük | Solid olan `bg-status-success-bg` kullanılmalı. |

## Öncelik Sırası
1. `bg-[#faf9f7]` gibi projenin tema renkleri dışında kalan arbitrary değerlerin silinmesi.
2. Avatar içerisindeki yasaklı `gradient` yapısının düzeltilmesi.
3. Hover ve border renklerinde yer alan `/[0.02]`, `/60` vb. şeffaflık (opacity) tanımlarının tamamen token'lara çekilmesi.

Rapor hazır. Düzeltmeleri hızlıca aynı yaklaşımla uygulamamı ister misin?
