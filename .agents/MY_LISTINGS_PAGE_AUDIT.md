# MyListingsPage Tasarım Audit
_Tarih: 2026-06-20_

## Genel Yapı
`MyListingsPage`, kullanıcının kendi ilanlarını yönettiği ve listelediği paneldir. Sayfa yapısı, tüm listeleme sayfa şablonunu yöneten `ListingsModuleLayout` bileşenini sarmalar.
- **Header Slotu (`topSlot`):** Sayfanın üst kısmında toplu doping reklamı (`BulkShowcaseBanner`), mağaza portföy değeri ve aktif ilan adet göstergelerini içeren "Portfolio Performance" kartı ve envanter uyarılarını barındıran "Inventory Management" alanı yer alır.
- **Aksiyonlar:** Sağ üst kısımda yeni ilan oluşturma (`Link` to `CREATE_LISTING`) butonu yer alır.
- **Listeleme Gövdesi:** `ListingsModuleLayout` aracılığıyla sol tarafta filtre çekmecesi (`FilterSidebar`), sağ tarafta ise ilanların listelendiği ana gövde bulunur.

## Component Haritası
- **`MyListingsPage` (Page Component)**
  - `ListingsModuleLayout` (Genel Listeleme Şablonu)
    - `FilterSidebar` (Filtre Çekmecesi)
    - `ListingsNavigation` (Navigasyon ve Arama)
      - `ListingsContent` (İlan Listesi)
  - `BulkShowcaseBanner` (Doping Kampanya Bannerı)
  - Portfolio Header Card (Portföy Performansı Kartı)
  - Inventory Management Section (Envanter Yönetimi ve Toplu Stok/Fiyat Güncelleme)
    - `LowStockCard` (Düşük Stok Kartı)
      - `ListingQuickEdit` (Hızlı Düzenleme Modülü)
      - Edit Link/Button (İlan Düzenleme Sayfası Linki)
    - Bulk Action Controls (Toplu Stok / Fiyat Girişi ve Seçim Alanı)
  - `BulkSelectionModal` (Doping İlan Seçim Modalı)
  - `BulkShowcaseModal` (Doping Satın Alma Modalı)

## Tespit Edilen Tasarım Sorunları
| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| **Yasaklı Gradient Kullanımı** | `MyListingsPage.jsx` (L27) | `LowStockCard` bileşeninde baş harf avatar arka planı için `bg-gradient-to-br from-indigo-500 to-indigo-600` gradient kullanılmıştır. | Gradient yerine düz renk token'ı (`bg-primary text-white`) kullanılmalıdır. |
| **Yasaklı Glassmorphism & Opacity** | `MyListingsPage.jsx` (L26, L35, L149) | `LowStockCard` arka planında `bg-background-primary/80 backdrop-blur`, butonlarında `bg-slate-100/80 hover:bg-slate-200/80` ve portföy kartında `bg-indigo-50/30` gibi opacity + blur kombinasyonları kullanılmıştır. | Blur kaldırılmalı, yarı opak renkler yerine düz `bg-background-primary border-border-light` ve butonlar için `bg-secondary-light hover:bg-secondary-200` gibi düz opak renkler kullanılmalıdır. |
| **Yasaklı Arbitrary Tipografi Boyutu** | `MyListingsPage.jsx` (L221) | Toplu envanter güncelleme satırında fiyat/stok bilgisi için `text-[9px]` sınıfı kullanılmıştır. | Tailwind standart scale dışına çıkılmamalı, yerine `text-caption` kullanılmalıdır. |
| **Buton ve Badge Radius Standart Dışı** | `MyListingsPage.jsx` (L136, L166, L174, L187) | Yeni İlan butonu `rounded-2xl` (normalde butonlar `rounded-lg` olmalı), aktif/toplam ilan rozetleri `rounded-xl` (normalde rozetler `rounded-md` olmalı), uyarı ikonu kutusu `rounded-xl` kullanmıştır. | Buton yuvarlaklığı `rounded-lg`, rozet ve küçük element yuvarlaklıkları `rounded-md` olarak güncellenmelidir. |
| **Doğrudan useEffect İçinde API Fetching (Kod Kalitesi İhlali)** | `MyListingsPage.jsx` (L68-78) | Vitrin doping fiyatlandırma konfigürasyonu (`showcaseService.getPricingConfig`) doğrudan `useEffect` içinde async olarak fetch edilip lokal state'e yazılmıştır. | `useEffect` spagettisini önlemek ve caching avantajı sağlamak için `@tanstack/react-query` `useQuery` hook'una taşınmalıdır. |
| **Hardcoded Renkler ve Token Tutarsızlıkları** | `MyListingsPage.jsx` (L35, L136, L148, L158, L162, L166, L171, L174, L175, L184, L202, L203, L209-224) | `slate-900`, `indigo-50`, `emerald-100`, `emerald-700` gibi Tailwind ham renk paletleri ve hardcoded renkler kullanılmıştır. | Projenin semantik renk token'ları (`primary`, `secondary-light`, `text-text-primary`, `text-text-muted`, `border-border-light`, `status-success` vb.) ile değiştirilmelidir. |

## Renk & Token Tutarsızlıkları
- `bg-slate-900 text-white hover:bg-slate-800` -> `bg-primary text-white hover:bg-primary-hover`
- `bg-slate-100/80 hover:bg-slate-200/80 text-slate-700` -> `bg-secondary-light hover:bg-secondary-200 text-text-secondary`
- `border-slate-100` -> `border-border-light`
- `bg-indigo-50/30` (Portföy kartı dekorasyonu) -> Kaldırılmalı veya `bg-primary-50` düz rengine çekilmeli.
- `text-slate-400`, `text-slate-500` -> `text-text-muted`, `text-text-secondary`
- `border-emerald-100 text-emerald-700 bg-status-success-bg` -> `border-status-success-border text-status-success-text bg-status-success-bg`
- `bg-slate-50 border-slate-100 text-slate-600` -> `bg-secondary-light border-border-light text-text-secondary`
- `hover:bg-slate-50 border-b border-slate-50` -> `hover:bg-secondary-light border-b border-border-light`
- `bg-indigo-50 border-primary text-primary` -> `bg-primary-50 border-primary text-primary`
- `bg-indigo-50 border-primary` -> `bg-primary-50 border-primary`
- `text-slate-500` -> `text-text-muted`

## Spacing Sorunları
- `LowStockCard` içindeki elemanlar `gap-3` kullanıyor (doğru), ancak buton/link boyutu `px-2 py-1.5` ile küçüktür. Spacing genel olarak dengeli.
- Envanter yönetimindeki kart listesinde `gap-3` ve `gap-2` arasında tutarsızlık var. Toplu seçim modunda `gap-2` yerine standart `gap-3` tercih edilmelidir.

## CTA & Buton Analizi
- **Yeni İlan Butonu (Birincil CTA):** `bg-slate-900 text-white rounded-2xl` -> `bg-primary text-white hover:bg-primary-hover rounded-lg` yapılmalı.
- **Toplu Stok Güncelleme Butonları:** `bg-slate-900` yerine `bg-primary text-white hover:bg-primary-hover rounded-lg`.
- **Toplu Fiyat Güncelleme Butonları:** `bg-background-primary text-text-primary border border-border-light` yerine `bg-secondary-light text-primary hover:bg-secondary-200 rounded-lg`.
- **Hızlı Düzenleme Düzenle Butonu:** `bg-slate-100/80` yerine `bg-secondary-light text-primary hover:bg-secondary-200 rounded-lg`.

## Mobil Uyum
- Sayfa mobilde dikey tek kolon düzenine (`flex-col`) uyum sağlar.
- Toplu güncelleme listesi mobilde scroll olabilmesi için `max-h-60 overflow-y-auto` sınıfına sahiptir.
- Düşük stok listesi mobilde `grid-cols-1 md:grid-cols-2` olarak düzenlenmiştir.

## Öncelik Sırası
1. **API Veri Çekme Düzeltilmesi (Kritik):** `useEffect` veri çekmesinin `useQuery`'ye taşınması.
2. **Yasaklı Desenlerin Temizlenmesi (Kritik):** `LowStockCard` ve diğer yerlerdeki gradient, backdrop-blur, opacity (`/80`, `/30`) kaldırılarak düz renk ve border tokenlarına geçilmesi.
3. **CTA ve Buton Düzenlemeleri (Yüksek):** Buton renklerinin ve radius değerlerinin (`rounded-lg`) standartlaştırılması.
4. **Rozet/Badge Radius ve Renk Düzeltmeleri (Orta):** Başarı/Toplam rozetlerinin `rounded-md` yapılması ve emerald/slate renklerinin semantik tokenlara dönüştürülmesi.
5. **Arbitrary Yazı Boyutlarının Düzeltilmesi (Düşük):** `text-[9px]` yerine `text-caption` kullanımı.
