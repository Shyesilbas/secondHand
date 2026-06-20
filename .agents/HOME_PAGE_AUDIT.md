# HomePage Tasarım & Kod Kalitesi Audit
_Tarih: 2026-06-20_

## Genel Yapı
Anasayfa (`HomePage.jsx`), minimal ve temiz bir yapıya sahiptir. Bölümler `Suspense` ve `lazy` component'ler kullanılarak yüklenmektedir.
Layout genel olarak dikey yığılmış (`flex flex-col` veya standart blok elementleri) ve 1280px genişlik sınırına (`max-w-7xl mx-auto`) sahiptir.

## Component Haritası
- `HomePage.jsx` (Ana Konteyner)
  - `HeroSection.jsx` (Giriş Bölümü)
    - `HeroListingCard.jsx` (Öne Çıkan Kartlar)
  - `TrustBand.jsx` (Güven Şeridi)
  - `MarketplaceStatsSection.jsx` (İstatistikler)
  - `CategoryHub.jsx` (Kategori Kartları)
  - `ShowcaseSection.jsx` (Vitrin İlanları)
  - `GreatSellersSection.jsx` (Güvenilir Satıcılar)
    - `GreatSellerRulesCallout.jsx` (Kurallar Paneli)
  - `TrustExperienceSection.jsx` (Teknoloji & Güven Detayları)

---

## Tespit Edilen Tasarım Sorunları & Kural İhlalleri

| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| `text-[58px]` arbitrary yazı boyutu | `HeroSection.jsx:54` | Tasarım dışı tipografi (Kural İhlali) | `text-4xl lg:text-5xl` standart class ile değiştir |
| `py-3.5` büyük buton padding'i | `HeroSection.jsx:58, 63` | Buton boyutu standarda uymuyor (Kural İhlali) | Maksimum `py-2.5` standart buton padding'ine çek |
| `rounded-2xl` buton/link | `HeroSection.jsx:58, 63` | Radius standardına aykırı (Kural İhlali) | Button/input için `rounded-lg` yap |
| `bg-slate-950` ve `hover:bg-slate-800` | `HeroSection.jsx:63` | Hardcoded renk kullanımı (Kural İhlali) | Birincil CTA rengi olan `bg-primary hover:bg-primary-hover` yap |
| `backdrop-blur` ve `bg-opacity` kombinasyonu | `HeroSection.jsx:83, 97, 101` | Yasaklanmış Glassmorphism kullanımı (Kural İhlali) | Standart kart arka planı ve border rengi kullan |
| Hardcoded Renkler (`text-slate-500`, `border-emerald-100` vb.) | Tüm dosyalarda (`HeroSection`, `HeroListingCard`, `CategoryHub`, `ShowcaseSection`, `GreatSellersSection`, `TrustBand`, `TrustExperienceSection`, `MarketplaceStatsSection`) | Tema dışı renkler, tutarsızlık | Semantik token'lar kullan (`text-text-secondary`, `text-text-muted`, `border-border-light`, `bg-background-secondary`) |
| `/60`, `/70`, `/80` ve `/50` opacity kullanımı | `HeroSection.jsx`, `CategoryHub.jsx`, `MarketplaceStatsSection.jsx`, `ShowcaseSection.jsx`, `TrustExperienceSection.jsx` | Yasaklanmış opaklık kullanımı (Kural İhlali) | Opaklık yerine düz semantik arka plan veya border renkleri kullan |
| `rounded-2xl` normal kartlarda kullanımı | `HeroListingCard.jsx:24`, `MarketplaceStatsSection.jsx:81`, `ShowcaseSection.jsx:133, 136`, `GreatSellersSection.jsx:52, 113`, `GreatSellerRulesCallout.jsx:26`, `TrustExperienceSection.jsx:45` | Radius standardına aykırı (Kural İhlali) | Normal card'lar için `rounded-xl` yap (`rounded-2xl` sadece büyük kart ve modaller içindir) |
| Manuel İskelet (Skeleton) Yapımı | `ShowcaseSection.jsx:119`, `MarketplaceStatsSection.jsx:61`, `GreatSellersSection.jsx:113` | Standart dışı loading tasarımı | Ortak component olan `<SkeletonGrid />`, `<SkeletonCard />` veya `<Skeleton />` kullan |
| `rounded-xl` avatar kullanımı | `GreatSellersSection.jsx:55` | Profil görseli standardına aykırı | Avatarlar için daima `rounded-full` kullan |
| Arbitrary text boyutu `text-[9px]` | `HeroListingCard.jsx:28, 30`, `ShowcaseSection.jsx:130`, `GreatSellersSection.jsx:87`, `TrustExperienceSection.jsx:51` | Tasarım dışı tipografi (Kural İhlali) | `text-caption` veya `text-xs` kullan |
| Hardcoded Renk Kodları (`bg-[#f5f7fb]`, `bg-[#fafafa]`) | `ShowcaseSection.jsx:79`, `GreatSellersSection.jsx:108` | Tasarımla uyumsuzluk (Kural İhlali) | Semantik token'lar kullan (`bg-background-secondary`, `bg-background-primary`) |

---

## Renk & Token Tutarsızlıkları
- `slate-400`, `slate-500`, `slate-600`, `slate-700` -> `text-text-secondary` veya `text-text-muted` olmalı.
- `slate-100`, `slate-50` -> `border-border-light` veya `bg-background-tertiary` olmalı.
- `blue-50`, `indigo-50`, `rose-50`, `purple-50`, `orange-50` gibi hardcoded kategori arka planları ve bunların border'ları semantik renklere çevrilmeli.

## Spacing Sorunları
- Grid'lerde `gap-3.5` veya `gap-8 lg:gap-10` gibi tutarsız değerler yerine standart `gap-4` veya `gap-6` tercih edilmeli.

## CTA & Buton Analizi
- Hero üzerindeki arama linki ve "Satışa Başla" butonu tasarım standartlarına (`rounded-lg`, `py-2.5`, `bg-primary`) uygun hale getirilmeli.
- "Tüm Marketi Gör" linki `Link` yerine buton formuna uydurulmuş, o da standarda çekilmeli (`rounded-lg`, `py-2.5`).

## Mobil Uyum
- `CategoryHub.jsx` üzerindeki kategori butonları mobilde yana kaydırılabilir (`overflow-x-auto`) durumda fakat radius ve border tutarsızlıkları düzeltilmeli.
- Hero altındaki stats'lar mobilde dikey olarak üst üste yığılmalı.

## Öncelik Sırası
1. **Kritik:** Arbitrary font boyutlarının (`text-[58px]`, `text-[9px]`) ve radius'ların (`rounded-2xl` kartlarda) semantik olanlarla değiştirilmesi.
2. **Kritik:** Hardcoded renk kodlarının (`#f5f7fb`, `#fafafa`) ve hardcoded Tailwind renklerinin (`emerald-100`, `slate-500`, `indigo-50` vb.) semantik token'lara geçirilmesi.
3. **Kritik:** Opacity (`bg-opacity`, `/50` vb.) ve Glassmorphism (`backdrop-blur`) yasaklı kullanımlarının kaldırılması.
4. **Orta:** Manuel loading skeleton yapılarının ortak `<SkeletonGrid />` component'ine taşınması.
5. **Düşük:** Buton padding'lerinin (`py-3.5` -> `py-2.5`) ve avatar tipinin (`rounded-xl` -> `rounded-full`) standartlaştırılması.
