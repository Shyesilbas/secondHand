# Home Page Tasarım Audit
_Tarih: 2026-06-21_

## Genel Yapı
HomePage 6 ana bileşenden oluşmaktadır: `HeroSection`, `TrustBand`, `MarketplaceStatsSection`, `ShowcaseSection`, `GreatSellersSection` ve `TrustExperienceSection`.
Tasarım büyük ölçüde tema token'ları kullanılarak yapılmış, ancak bazı bölümlerde arbitrary opacity (opacity/oranları) ve yasaklı glassmorphism pattern'leri ile standart dışı renk kullanımları (amber) mevcuttur.

## Component Haritası
- `HomePage`
  - `HeroSection` (Ana banner ve featured ilanlar)
  - `TrustBand` (Güven özellikleri şeridi)
  - `MarketplaceStatsSection` (İstatistikler)
  - `ShowcaseSection` (Öne çıkan ilanlar - kategori tablı)
  - `GreatSellersSection` (En iyi satıcılar)
  - `TrustExperienceSection` (Detaylı güven/platform özellikleri)

## Tespit Edilen Tasarım Sorunları

| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| Arbitrary Opacity (`border-border-light/70`) | `HeroSection.jsx` Satır 42 | Orta | Opacity kaldırılarak direkt `border-border-light` kullanılmalı. |
| Glassmorphism / Arbitrary Opacity (`bg-white/5 border-white/10`) | `HeroSection.jsx` Satır 95, 99 | Yüksek | `bg-background-dark` ve `border-border-dark` gibi solid theme token'larına geçilmeli. |
| Arbitrary Opacity (`border-border-light/70`) | `ShowcaseSection.jsx` Satır 65 | Orta | Opacity kaldırılarak direkt `border-border-light` kullanılmalı. |
| Hardcoded Renk Skalası (`bg-secondary-200`) | `ShowcaseSection.jsx` Satır 75 | Düşük | `hover:bg-secondary` semantic token'ı kullanılmalı. |
| Semantic Olmayan Renk (`text-amber-400 fill-amber-400`) | `GreatSellersSection.jsx` Satır 58 | Yüksek | Tema `status-warning` (veya accent.amber.500) token'ları kullanılmalı. (`text-status-warning fill-status-warning`) |

## Renk & Token Tutarsızlıkları
- `bg-white/5` ve `border-white/10` -> Yasaklı pattern. Dark bir container için `bg-background-dark` / `border-border-dark` kullanılmalı.
- `border-border-light/70` -> Yarı şeffaf kenarlıklar yasak, `border-border-light` olmalı.
- Yıldız ikonlarında `amber-400` kullanılmış, `status-warning` semantic token'ı ile değiştirilecek.

## Spacing Sorunları
- Tespit edilmedi, responsive grid ve gap kullanımları başarılı.

## Öncelik Sırası
1. `HeroSection` içindeki glassmorphism ve arbitary bg opacity'lerin kaldırılması.
2. `GreatSellersSection` içindeki harcoded star color'ın semantic token'a çevrilmesi.
3. Çeşitli bileşenlerdeki `border-border-light/70` opacity uzantılarının temizlenmesi.
