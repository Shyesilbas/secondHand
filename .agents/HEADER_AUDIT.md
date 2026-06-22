# Header Tasarım Audit
_Tarih: 2026-06-21_

## Genel Yapı
Header, desktopta ana arama barı ve navigasyon ile flex/grid tabanlı olarak yerleşiyor. Yapışkan (sticky) davranış ile scroll sırasında background rengi değiştiriyor. Ancak scroll sırasında `backdrop-blur` kullanılarak glassmorphism kuralı ihlal ediliyor. Arbitrary border/opacity sınıfları da bulunuyor.

## Component Haritası
- `Header` (Ana bileşen)
  - `UnifiedSearchBar` (Merkez Arama)
  - `HeaderNavLink` (Desktop linkleri)
  - `HeaderAuthActions` (Kullanıcı giriş yapmışsa eylemler ve dropdownlar)
    - `HeaderInboxMenu`, `HeaderIconButton`, `HeaderPaymentsMenu`, vs.
  - `HeaderGuestActions` (Kullanıcı giriş yapmamışsa)

## Tespit Edilen Tasarım Sorunları
| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| Glassmorphism kullanımı (`backdrop-blur-xl`) | `Header.jsx` Satır 61 | Yüksek (Kural İhlali) | `backdrop-blur-xl` sınıfı kaldırılmalı. |
| Hardcoded Opacity Sınıfları (`/90`, `/60`, `/40`) | `Header.jsx` Satır 61 | Orta (Tutarsızlık) | `bg-background-primary`, `border-border-light` gibi salt semantic token'lar kullanılmalı. |
| Hardcoded Renk Kullanımı (`bg-gray-900`, `hover:bg-gray-800`) | `HeaderGuestActions.jsx` Satır 18 | Yüksek (Kural İhlali) | `bg-primary`, `hover:bg-primary-hover` yapılmalı. |
| Hardcoded Renk Kullanımı (`bg-gray-300`, `text-slate-600`) | `HeaderAuthActions.jsx` Satır 54, 60 | Orta (Tutarsızlık) | `bg-border-light` veya `bg-border-divider` ve `text-text-muted` kullanılmalı. |
| Opacity / Arbitrary (`hover:bg-slate-100/50`) | `HeaderAuthActions.jsx` Satır 60 | Düşük (Kozmetik) | Semantic olarak `hover:bg-secondary` kullanılmalı. |

## Renk & Token Tutarsızlıkları
- `bg-gray-900` -> `bg-primary`
- `bg-gray-800` -> `hover:bg-primary-hover` VEYA tema bazlı uygun buton efekti
- `text-slate-600` -> `text-text-muted` veya `text-text-secondary`
- `bg-gray-300` -> `bg-border-divider` (veya uygun bir border token)
- `bg-background-primary/90` -> `bg-background-primary` (solid background kullanılmalı)

## Spacing Sorunları
- Yok. Genellikle py-2 gibi standart tailwind sınıfları mevcut.

## CTA & Buton Analizi
- Kayıt Ol (Guest) butonu `bg-gray-900` renginde hardcoded, projenin `bg-primary` hiyerarşisine uymuyor.

## Mobil Uyum
- Header mobil cihazlar için tasarlanmış. Menu toggle butonu (hamburger menu) var. Ancak hardcoded hover sınıfları bulunuyor.

## Öncelik Sırası
1. `Header.jsx` içindeki backdrop ve opacity sınıflarının (glassmorphism pattern) temizlenmesi
2. `HeaderGuestActions.jsx` içindeki `bg-gray-900` olan CTA butonunun semantic tokena çevrilmesi
3. `HeaderAuthActions.jsx` içindeki separator ve toggle butonunun semantic renklere çevrilmesi
