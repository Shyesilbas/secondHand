# ListingDetailPage Tasarım Audit
_Tarih: 2026-06-20_

## Genel Yapı
`ListingDetailPage` genel sayfa yapısı responsive bir grid düzeni üzerine kurulmuştur. Sayfa, mobil cihazlarda tek sütun halinde akarken, büyük ekranlarda (`lg:grid-cols-12`) 12 kolonluk bir grid yapısı kullanarak iki ana bölüme ayrılır:
- **Sol Kolon (`lg:col-span-7 xl:col-span-8`):** Başlık bloğu, görsel galerisi, temel özellikler, Aura AI özeti, açıklama kısmı, dinamik kategori spesifikasyonları (`DetailsComponent`), güvenli buluşma paneli (`SafeMeetupPanel`) ve ürün yorumları (`ListingReviewsSection`) dikey bir akış (`space-y-4`) halinde yer alır.
- **Sağ Kolon (`lg:col-span-5 xl:col-span-4`):** Fiyatlandırma, stok, acil rezervasyon sayıları, satın alma/teklif butonları (`CTA`), satıcı güven paneli (`ListingTrustPanel`) ve pazar analizi özetini barındıran yapışkan bir sidebar (`sticky top-[66px]`) olarak tasarlanmıştır.
- **Header:** Üst kısımda `sticky top-0 z-40` konumunda yer alan ve glassmorphism efekti (`listing-glass`) içeren ince border'lı bir navigasyon barı bulunmaktadır.
- **Mobil Alt Bar:** Büyük ekranlarda gizlenen (`lg:hidden`), mobil cihazlarda ise ekranın en altında sabitlenen (`fixed bottom-0 left-0 right-0 z-50 listing-mobile-bar px-4 py-3 pb-safe`) ve fiyat ile anlık "Contact Seller"/"Add to Cart" aksiyonlarını barındıran bir alt bar mevcuttur.

## Component Haritası
- **`ListingDetailPage` (Page Component)**
  - `PageContainer` (Genel Kapsayıcı)
    - `header` (Sticky Navigasyon & Aksiyonlar Barı)
      - `PageContainer` (İçerik Hizalama)
        - `nav` (Breadcrumb / Ekmek Kırıntısı Navigasyonu)
        - `div` (Ask Aura AI, Karşılaştır, Favoriye Ekle, Paylaş Butonları)
    - `MakeOfferModal` (Teklif Verme Modalı - Duruma Bağlı)
    - `div.grid` (12 Kolonluk Ana Grid)
      - **Sol Bölüm (`lg:col-span-7 xl:col-span-8`):**
        - `section` (Başlık Bloğu: Kategori, Kampanya Rozeti, Ürün Adı, Konum, Tarih, Görüntülenme Sayısı)
        - `section` (Görsel Galerisi: Ana resim, yön okları, thumbnail listesi)
        - `section` (Key Specs: Kategoriye özel dinamik özet rozetleri)
        - `AuraSummary` (Aura AI Tarafından Üretilen Özet Modülü)
        - `section` (Açıklama Bloğu: Ürün açıklaması ve "Daha Fazla Oku" seçeneği)
        - `section` (Spesifikasyonlar Bloğu: `DetailsComponent` aracılığıyla kategoriye özel detaylar listesi)
        - `SafeMeetupPanel` (Güvenli Buluşma Rehberi ve Adımları)
        - `section` (Yorumlar Bloğu: `ListingReviewsSection`)
      - **Sağ Bölüm (Sticky Sidebar - `lg:col-span-5 xl:col-span-4`):**
        - `div.sticky` (Yapışkan Sidebar Kapsayıcısı)
          - `div` (Fiyatlandırma & Satın Alma Kartı)
            - Fiyat ve kampanya indirim bilgisi (`formatCurrency`)
            - Stok durumu rozeti ve acil rezervasyon göstergesi
            - Birincil CTA: "Add to Cart" butonu
            - İkincil CTA: "Make an Offer" butonu (pazarlığa açıksa)
            - Güvenlik garantileri ("Buyer Protection", "Secure Escrow" ibareleri)
            - `ListingTrustPanel` (Satıcı bilgileri, Takip Et butonu, yıldızlı puan durumu ve Satıcıyla İletişim / Showcase Butonları)
            - `ListingAnalyticsPanel` (Pazar Analizi Teaser Paneli: tıklandığında modal tetikler)
              - `ListingInfoModal` (Detaylı Pazar Analizi Modalı Portalı)
                - Sol Bölüm: Ürün Fotoğrafı & Featured Rozeti
                - Sağ Bölüm: Fiyat, Escrow Koruması, Kategori Rozetleri, Satıcı Bilgisi ve Yorum Sayısı
                - Analiz Sekmeleri Seçici (`PriceHistoryTab`, `ExchangeRatesTab`, `ViewStatisticsCard`)
  - `SimilarListings` (Benzer Ürünler Karuseli)
  - `div.fixed` (Mobil Alt Sabit Bar)
- **`FilterSidebar` (Filtre Çekmecesi - Ayrı Listeleme Sayfasında Kullanılır):**
  - `aside` (Sol taraftan kayan drawer kapsayıcısı - `fixed left-0 top-0 h-[100dvh] w-80`)
    - `header` (Filtre başlığı ve mobil kapatma butonu)
    - `div` (Dinamik kaydırılabilir filtre içerik alanı)
      - Mine modu ise: Kategori / Durum sekmeleri ve `OptionRow` listesi
      - Browse modu ise: Kategori seçim çipleri, Bütçe/Konum alanları (`PriceLocationFields`), Kategoriye özel dinamik filtreler (`FilterRenderer`)
    - `footer` (Filtreleri Uygula ve Sıfırla butonları)

## Tespit Edilen Tasarım Sorunları
| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| **Gradient Kullanımı (Yasak İhlali)** | `ListingDetailPage.jsx` (L321, L379, L389), `ListingInfoModal.jsx` (L130), `ListingAnalyticsPanel.jsx` (L20), `FilterSidebar.jsx` (L86) | Tasarım rehberindeki `bg-gradient-to-*` yasağı ihlal edilmiştir. UI tutarlılığı bozulmaktadır. | Gradient arka planları düz renk (`bg-background-secondary` veya `bg-slate-50`) ile değiştirilmelidir. |
| **Glassmorphism Kullanımı (Yasak İhlali)** | `ListingDetailPage.jsx` (L236, L340, L409), `ListingInfoModal.jsx` (L126, L283), `FilterSidebar.jsx` (L76, L157) | Tasarım rehberindeki `backdrop-blur`, `bg-opacity-*` glassmorphism kombinasyonları yasağı ihlal edilmiştir. | Blur efektleri kaldırılmalı, temiz opak veya yarı opak arka plan renkleri kullanılmalıdır. |
| **Büyük Buton Padding Değerleri (Yasak İhlali)** | `ListingDetailPage.jsx` (L96, L443, L447, L495), `FilterSidebar.jsx` (L159, L160) | Tasarım rehberinde buton padding'i en fazla `py-2.5` olarak belirtilmişken `py-3` ve `py-3.5` kullanılmıştır. | İlgili butonların dikey padding değerleri `py-2` veya `py-2.5` standartlarına çekilmelidir. |
| **Büyük Font Kullanımı (Yasak İhlali)** | `ListingDetailPage.jsx` (L415) | Genel UI kartı içerisinde `text-3xl` gibi büyük fontlar kullanılmıştır. Bu rehberde sadece sayfa başlıkları için serbesttir. | Sidebar fiyat yazı boyutu `text-xl` veya `text-2xl` seviyesine çekilmelidir. |
| **Hizalama ve Padding Tutarsızlığı** | `ListingDetailPage.jsx`, `SafeMeetupPanel.jsx` (L7) | Sol kolondaki kartların padding değerleri tutarsızdır (Galeri: `p-2.5 sm:p-3`, Genel Kartlar: `p-4 sm:p-5`, SafeMeetup: `p-6 sm:p-8`). Kartların dış border'ları dikeyde hizasız görünmektedir. | Tüm kart kapsayıcılarının padding değerleri `p-4 sm:p-5` olarak standartlaştırılmalıdır. |
| **Mobil Alt Barda Eksik Teklif Aksiyonu** | `ListingDetailPage.jsx` (L479-499) | Pazarlığa açık ürünlerde mobil kullanıcılar fiyatı ve sepet butonunu görürken "Teklif Ver" (Make an Offer) aksiyonunu alt barda göremez. Sayfada çok aşağı kaydırmaları gerekir. | Eğer `canMakeOffer` aktifse mobil alt bara ikincil bir teklif verme butonu eklenmelidir. |
| **Statik / Inline Style Kullanımı** | `ListingDetailPage.jsx` (L236) | Sticky navigasyon başlığında inline `style={{ fontSize: '13px' }}` kullanılmıştır. | Inline stil kaldırılmalı ve Tailwind `text-xs` (veya `text-sm`) sınıfı atanmalıdır. |
| **Avatar Şekli Standart Dışı** | `ListingInfoModal.jsx` (L226), `ListingTrustPanel.jsx` (L36) | Satıcı avatarı için `rounded-xl` kullanılmıştır. Tasarım rehberine göre avatarlar `rounded-full` olmalıdır. | Avatarlardaki `rounded-xl` sınıfı `rounded-full` olarak güncellenmelidir. |
| **Fiyat ve İndirim Tasarımı Uyuşmazlığı** | `ListingInfoModal.jsx` (L170) vs `ListingDetailPage.jsx` (L422) | Detay sayfasında kampanya indirim rozeti yeşil (`bg-status-success-bg text-emerald-700`) iken, modalda kırmızı (`bg-rose-500 text-white`) ve farklı bir ikonla sunulmuştur. | İndirim rozetinin rengi ve ikonu her iki görünümde de standart başarı/indirim rozeti token'ı ile birleştirilmelidir. |

## Renk & Token Tutarsızlıkları
Bileşenlerde Tailwind'in standart renk paleti (örneğin `slate-xxx`, `rose-xxx`, `indigo-xxx`) ve bazı hardcoded hex kodları doğrudan kullanılmıştır. Tasarım rehberine göre bunların semantik token'larla eşleştirilmesi gerekmektedir:
- **Hardcoded Arka Planlar:**
  - `bg-[#f7f8fa]` (`ListingDetailPage.jsx` L60, L89, L233) -> `bg-background-secondary` kullanılmalı.
  - `bg-[#faf9f7]` (`ListingInfoModal.jsx` L224) -> `bg-background-secondary` kullanılmalı.
  - `bg-slate-50`, `bg-slate-100`, `bg-slate-200`, `bg-slate-300`, `bg-slate-900` yerine uygun semantik arka plan token'ları (`bg-background-secondary`, `bg-secondary-light` vb.) atanmalı.
- **Hardcoded Metinler:**
  - `text-slate-400`, `text-slate-500`, `text-slate-650` -> `text-text-muted` kullanılmalı.
  - `text-slate-700`, `text-slate-800`, `text-slate-950` -> `text-text-primary` kullanılmalı.
  - `text-slate-950` fiyat rengi olarak kullanılmıştır -> `text-text-primary` kullanılmalı.
- **Hardcoded Kenarlıklar ve Ringler:**
  - `border-slate-100`, `border-slate-200`, `border-border-light/50` -> `border-border-light` kullanılmalı.
  - `ring-slate-200/80` -> `ring-border-light` veya rehbere uygun standart ring sınıfları kullanılmalı.

## Spacing Sorunları
- Sayfa ve bileşen kartları arasındaki boşluk değerleri düzensizdir. Sol sütun `space-y-4` ile dikey boşluk ayırırken, sağ sütun kendi içinde `space-y-4` kullanmaktadır ancak benzer ürünler modülü ile ana grid arasında `mt-10 sm:mt-14` gibi çok büyük bir dış boşluk bulunmaktadır.
- `SafeMeetupPanel.jsx` bileşeninde `mb-10` gibi yüksek bir margin-bottom değeri hardcoded yazılmıştır, bu da sol sütundaki diğer dikey hizalamaları (`space-y-4`) bozmaktadır.
- Görsel galerisinin altındaki küçük resim şeridinde (`thumbnail strip`) `mt-2 gap-1.5 pb-1` kullanılmıştır. Standart spacing değerleri (`gap-2`) yerine arbitrary `gap-1.5` tercih edilmiştir.

## CTA & Buton Analizi
- **Birincil CTA (Sepete Ekle):** `bg-slate-900 text-white rounded-xl` olarak tasarlanmıştır. Tasarım rehberine göre ana buton rengi `bg-primary text-white hover:bg-primary-hover` ve buton radius değeri `rounded-lg` olmalıdır.
- **İkincil CTA (Teklif Ver):** `border-2 border-border-light text-slate-800 rounded-xl` yerine `bg-secondary-light text-primary hover:bg-secondary-200 rounded-lg` kullanılmalıdır.
- **Mobil Birincil CTA (Sepet):** `bg-slate-900 text-white rounded-2xl` olarak tasarlanmıştır. Hem radius `rounded-2xl` ile standart dışıdır hem de renk hardcoded'dır.
- **Detay Hatası Geri Dönüş CTA:** `bg-slate-900 text-white rounded-2xl` yine benzer şekilde radius ve renk standartlarına uymamaktadır.
- **Aksiyon Butonları Yuvarlaklığı:** Sayfa üst kısmındaki "Ask Aura", "Favorite" ve "Share" gibi butonlar `rounded-xl` kullanmaktadır, ancak buton standardı `rounded-lg` olmalıdır.

## Mobil Uyum
- Grid düzeni `grid lg:grid-cols-12` sayesinde mobil cihazlarda dikey tek kolon düzenine başarıyla geçmektedir.
- Mobil cihazlarda sidebar en alta kaydığı için, kritik bilgiler (fiyat, satıcı, pazar analizi) en altta yorumların da altında kalmaktadır. Bu durum mobil alt bar (`listing-mobile-bar`) ile kısmen çözülmüştür.
- Ancak mobil alt bar `pb-safe` (safe-area-inset-bottom) desteği içermesine rağmen, sayfa genel kapsayıcısındaki bottom padding değeri mobil ve masaüstü arasında (`pb-28 lg:pb-16`) alt bar yüksekliğine tam oturmayabilir veya bazı cihazlarda içeriğin alt barın altında kalmasına yol açabilir.
- Görsel galerisindeki yön okları mobilde `opacity-100` olarak sürekli görünür durumdayken masaüstünde hover durumuna (`sm:opacity-0 sm:group-hover:opacity-100`) bağlanmıştır, bu doğru bir yaklaşımdır.
- Filtre çekmecesi (`FilterSidebar`), mobilde genişlik sınırını `max-w-[calc(100vw-1.25rem)]` olarak koruyarak ekran dışı tıklama alanını garantiye almaktadır, bu durum mobil uyumluluğu artırmaktadır.

## Öncelik Sırası
1. **Hardcoded Renkler ve Token Kullanımı:** Sayfadaki tüm hardcoded renk ve arka plan sınıflarının (`bg-[#f7f8fa]`, `slate-xxx` vb.) standart semantik token'larla (`bg-background-secondary`, `text-text-primary`, `text-text-muted`) değiştirilmesi.
2. **Yasaklanan Tasarım Kurallarının Temizlenmesi:** Tüm bileşenlerden `bg-gradient-to-*` gradient yapılarının ve `backdrop-blur`, `listing-glass` glassmorphism efektlerinin kaldırılması.
3. **Border Radius ve Buton Padding Standardizasyonu:** Butonların dikey padding değerlerinin en fazla `py-2.5` yapılması, buton/input radius'larının `rounded-lg`, kart radius'larının `rounded-xl`, modal/büyük kart radius'larının ise en fazla `rounded-2xl` (arbitrary değerler ve rounded-3xl/t-[28px] kaldırılacak şekilde) olarak güncellenmesi.
4. **Kart Padding Tutarsızlıklarının Giderilmesi:** `SafeMeetupPanel`, `ListingTrustPanel`, Image Gallery ve genel kartların padding değerlerinin `p-4 sm:p-5` standardına getirilerek görsel hizalamanın kusursuzlaştırılması.
5. **Mobil Alt Bar İyileştirmesi:** Mobil alt bara `canMakeOffer` durumuna göre "Make an Offer" teklif verme aksiyonunun eklenmesi.
