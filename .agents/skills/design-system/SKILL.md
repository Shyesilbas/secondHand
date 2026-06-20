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
3. Border radius: Standartlara göre kullan (Detaylar aşağıda)
4. Shadow: `shadow-sm` veya `shadow-md` kullan — ağır veya arbitrary shadow yasak
5. Yeni component bitince `DESIGN_AUDIT.md`'ye ekle

## Border Radius Standardı
| Kullanım | Class |
|----------|-------|
| Badge, tag, küçük element | `rounded-md` |
| Button, input | `rounded-lg` |
| Card | `rounded-xl` |
| Büyük card, modal | `rounded-2xl` |
| Avatar, tam yuvarlak | `rounded-full` |

## Kesinlikle Yazma
- `rounded-[24px]`, `rounded-[2.5rem]` gibi arbitrary değerler
- `rounded-3xl` ve üstü — maksimum `rounded-2xl`
- `shadow-[...]` arbitrary shadow — `shadow-sm` veya `shadow-md` kullan

## Referans Component'ler (Dokunma)
- `src/common/services/cacheService.js` — cache pattern
- `src/common/components/` — mevcut doğru örnekler
