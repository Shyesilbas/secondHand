# Buyer Analytics Page Tasarım Audit
_Tarih: 2026-06-21_

## Genel Yapı
`BuyerDashboardPage.jsx` sayfası kullanıcıların alışveriş analitiğini ve sipariş geçmişi trendlerini gösteren bir dashboard sayfasıdır. Sayfanın başlığında koyu tema gradient kullanılmış, arka planlarda ise arbitrary hex kodlarına yer verilmiştir. Border'larda ve badge'lerde de tema standartlarından sapmalar bulunmaktadır.

## Component Haritası
- `BuyerDashboardPage`
  - Header (Sayfa Başlığı, Özet İstatistikler ve Tarih Seçici)
  - Primary KPIs (MetricCard'lar)
  - QuickStatusSummary
  - Charts (RevenueChart, CategoryBreakdown, OrderStatusBreakdown)

## Tespit Edilen Tasarım Sorunları

| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| Arbitrary Hex Background (`bg-[#f8f9fb]`) | Satır 52, 61, 72 | Yüksek | Tema standardı olan `bg-background-secondary` token'ına geçirilmeli. |
| Yasaklı Gradient Header (`bg-gradient-to-r from-slate-900 ...`) | Satır 74 | Yüksek | Koyu konsept devam edecekse `bg-background-dark`, `border-border-dark` gibi solid dark token'lara ya da varsayılan `bg-background-primary` / `bg-page-hero` yapısına dönüştürülmeli. |
| Arbitrary Opacity & Renk (`text-emerald-300/70`, `text-primary-50/70`) | Satır 86, 90 | Orta | Şeffaflık içermeyen, dark arka plana uygun tema token'ları (örn. `text-text-muted` veya dark mode için geçerli inverse text) kullanılmalı. |
| Hardcoded Border (`border-slate-100`, `border-slate-800`) | Satır 28, 62, 74, 124 | Orta | `border-border-light` (veya dark için `border-border-dark`) kullanılmalı. |
| Hardcoded Durum Rengi (`bg-rose-50 text-rose-500`) | Satır 63 (Hata Kutusu) | Yüksek | Hata durumu için tasarlanan `bg-status-error-bg` ve `text-status-error` kullanılmalı. |

## Öncelik Sırası
1. Arka plandaki `bg-[#f8f9fb]` renklerinin silinmesi.
2. Üst Header kısmındaki gradient'ın iptal edilerek solid dark token'lara (`bg-background-dark`) çevrilmesi.
3. Hata kutusu ikonundaki rose renginin status semantic yapısına alınması.
4. Çeşitli şeffaf ve hardcoded yazı/ikon renklerinin düzeltilmesi.

Rapor hazır. Belirlenen bu ihlalleri semantic token'lara çekerek düzeltmeye başlayayım mı?
