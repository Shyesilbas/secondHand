# ShoppingCartPage Tasarım ve UX Audit
_Tarih: 2026-06-21_

## 1. Genel Yapı & Düzen (Layout)
- **Sayfa Hiyerarşisi**: Sayfa, ana ürün listesi (`lg:col-span-8`) ve sağ tarafta özet kutusu (`lg:col-span-4`) olmak üzere iki sütunlu modern bir grid yapısına sahip. Bu yerleşim genel olarak doğru ancak sayfa arka planı ve kullanılan kart yapıları projenin minimal light temasıyla çelişiyor.
- **Özel Renk Paleti İhlali (`uiPalette.js`)**: 
  - Cart modülüne özel olarak geliştirilmiş `uiPalette.js` dosyası, tüm projede geçerli olan Teal (`#0d9488`) accent rengi yerine özel bir koyu mavi (`#1466c6` ve `#0f529e`) rengi birincil CTA'lerde kullanıyor.
  - Sayfa arka planı için warm-stone tonu olan `#f4f3f1` tercih edilmiş. Bu durum, projenin geri kalanındaki clean light temasıyla (`bg-background-secondary`) uyumsuz.
  - Sınırlar (borders) için `#e5e3df` ve metinler için `#111` / `#555` / `#999` gibi hardcoded gri tonları atanmış.

## 2. Component Analizi & Stil Hataları

### A. ShoppingCartPage.jsx
- **Hardcoded Renkler**:
  - `text-[#1a1918]` gibi koyu gri/siyah tonlar başlıklar ve fiyatlar için hardcoded kullanılmış (Örn: satır 210, 218, 258, 287, 325, 356).
  - Yükleme spinner'ında `border-[#1466c6]` (mavi) kullanılmış.
  - Kampanya indirim metinlerinde `text-[#107c10]` (parlak yeşil) kullanılmış.
  - Favoriler iskeleti altında `border-[#e0deda]` kullanılmış.
  - Bundle öneri kutularında `border-primary` yerine keyfi `border-[#1a1918]` butonlar ve `bg-[#f0efed]` ilerleme çubuğu renkleri tercih edilmiş.
  - Rezervasyon bildiriminde `border-[#d13438] bg-[#fdf3f2]` (sert kırmızı) ve `border-[#ca5010] bg-[#fff9f5]` (sert turuncu) renkler kullanılmış.

### B. CartItemCard.jsx
- **Aşırı Hardcoded Stil**:
  - Kartın hover durumunda `hover:bg-[#eef4fb]` (mavi arka plan lekesi) ve kaldır butonu hover'ında `hover:text-[#1466c6]` mavi rengi kullanılmış.
  - Dikey kenarlıkta `border-[#5f5b57]` koyu gri ve buton sınırlarında hardcoded `divide-[#e0deda]` tercih edilmiş.
  - Rezervasyon uyarısında `text-[#d13438]` kırmızı renk hardcoded.

### C. OrderSummary.jsx
- **Fiyat ve Sınır Renkleri**:
  - Toplam fiyat gösteriminde `text-[#1466c6]` (mavi) kullanılmış.
  - İndirim rozetinde `bg-[#dff6dd]` ve `text-[#107c10]` yeşil renkleri hardcoded.

---

## Tespit Edilen Tasarım Sorunları

| Sorun | Dosya / Konum | Etki Seviyesi | Çözüm Önerisi |
| :--- | :--- | :--- | :--- |
| **Mavi Accent Renkleri (Tasarım İhlali)** | `uiPalette.js`, `ShoppingCartPage.jsx`, `OrderSummary.jsx` | Kritik | Mavi accent (`#1466c6`) yerine projenin birincil Teal (`#0d9488` / `text-primary` / `bg-primary`) token'larına geç. |
| **Warm Stone Sayfa Canvası** | `uiPalette.js` | Orta | `#f4f3f1` yerine standart `bg-background-secondary` kullan. |
| **Hardcoded Yazı & Fiyat Renkleri** | `ShoppingCartPage.jsx`, `CartItemCard.jsx`, `OrderSummary.jsx` | Yüksek | `#1a1918` ve `#111` yerine `text-text-primary` ve `text-text-secondary` kullan. |
| **Hardcoded Durum Renkleri (Kırmızı/Yeşil/Turuncu)** | `ShoppingCartPage.jsx`, `CartItemCard.jsx` | Orta | Durum renklerini `text-status-success`, `bg-status-success-bg`, `text-status-error`, `bg-status-error-bg` gibi standarda bağla. |
| **Hover Efektlerindeki Mavi Renkler** | `CartItemCard.jsx` | Orta | Hover arka planını `hover:bg-background-secondary` veya `hover:bg-primary/5` yap. |
| **Hardcoded Sınırlar** | Tüm Cart Bileşenleri | Orta | `#e5e3df` sınır renklerini `border-border-light` yap. |

---

## Önerilen Çözüm Yolu
`uiPalette.js` dosyasını tamamen projenin kendi semantic token'larına (`text-text-primary`, `bg-background-secondary`, `bg-primary`, `border-border-light` vb.) map'leyecek şekilde refaktör ederek cart modülündeki tüm alt bileşenleri tek seferde sistem geneli Teal & Clean standartlarına çekmek.
