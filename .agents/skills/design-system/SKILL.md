---
name: Design System
description: Frontend'de UI component, renk, tipografi veya spacing değişikliği yapılacağında tetiklenir.
triggers:
  - "tasarım"
  - "renk değiştir"
  - "UI güncelle"
  - "component yaz"
  - "stil ekle"
  - "görünüm"
---

# Design System

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`
> Tasarım token'ları: `src/common/theme/theme.js`

## Tasarım Dili
- **Tema:** Light, minimal, clean
- **Accent:** Teal (#0d9488)
- **His:** Sade, bol beyaz alan, ince border'lar, küçük shadow

## Tipografi Standardı
| Kullanım | Class |
|----------|-------|
| Sayfa başlığı | `text-2xl font-semibold` |
| Section başlığı | `text-lg font-semibold` |
| Card başlığı | `text-sm font-medium` |
| Gövde metni | `text-sm` veya `text-base` |
| Yardımcı metin | `text-body text-text-muted` |
| Çok küçük etiket | `text-caption` |

## Kesinlikle Yazma
- `text-[14px]`, `text-[20px]` gibi arbitrary değerler
- `font-black`, `font-extrabold`
- `leading-[1.5]` gibi arbitrary line-height

## Kesinlikle Yapma
- Hardcoded renk yazma: `text-gray-900`, `bg-blue-600`, `#f7f6f5` — her zaman token kullan
- `text-[14px]` gibi arbitrary tipografi değeri yazma — `text-body`, `text-sm` kullan
- Büyük buton padding'i (`py-4`, `py-5`) — maksimum `py-2.5`
- Büyük font (`text-2xl`, `text-3xl`) genel UI'da — sadece sayfa başlığında
- Gradient background: `bg-gradient-to-*` — yasak
- Bubble / glassmorphism efekti: `backdrop-blur`, `bg-opacity-*` karmaşık kombinasyonlar — yasak
- `style={{ color: '...' }}` ile statik renk — Tailwind class kullan

## Token Kullanım Rehberi
| İhtiyaç | Kullan |
|---------|--------|
| Ana buton | `bg-primary text-white hover:bg-primary-hover` |
| İkincil buton | `bg-secondary-light text-primary hover:bg-secondary-200` |
| Sayfa arka planı | `bg-background-secondary` |
| Card arka planı | `bg-card-bg border border-border-light` |
| Ana metin | `text-text-primary` |
| Yardımcı metin | `text-text-muted` |
| Başarı durumu | `text-status-success bg-status-success-bg` |
| Hata durumu | `text-status-error bg-status-error-bg` |

## Component Yazarken
1. Token'dan başla — rengi kafadan yazma
2. Spacing: `gap-2`, `gap-3`, `gap-4` — arbitrary `gap-[14px]` yazma
3. Border radius: `rounded-md` veya `rounded-lg` — `rounded-2xl` ve üstü yasak
4. Shadow: `shadow-sm` maksimum — ağır shadow yasak
5. Yeni component bitince `DESIGN_AUDIT.md`'ye ekle

## Referans Component'ler (Dokunma)
- `src/common/services/cacheService.js` — cache pattern
- `src/common/components/` — mevcut doğru örnekler
