# Listing Paketi Teknik Rehber

Bu doküman `secondhand-frontend/src/listing` modülünde geliştirme yaparken hızlı karar almanız için yazıldı. Amaç: akışı, sorumluluk sınırlarını ve değişiklik stratejisini tek yerde netleştirmek.

## AI Çalışma Protokolü

Bu bölüm AI agent için direkt uygulama talimatıdır.

### Hedef

- İstenen değişikliği en az dosya dokunuşu ile yap.
- Katman sınırını koru: UI, hook, service sorumluluklarını karıştırma.
- Davranış değişikliği varsa ilgili `LISTING_DEFAULTS` ve payload serileştirmeyi birlikte değerlendir.

### Görev Tipi -> Dokunulacak Dosyalar

- Filtre alanı ekle/güncelle:
  - `filters/filterConfigs.js`
  - `services/listingService.js` (`serializeFilters`)
  - `hooks/utils/filterDefaults.js` (gerekiyorsa)
  - `components/FilterStatus.jsx` (özet/rozet etkileniyorsa)
- Arama davranışı/race/perf:
  - `hooks/useListingSearch.js`
  - `types/index.js` (`LISTING_DEFAULTS`)
- Liste çekme, pagination, mode:
  - `hooks/useListingEngine.js`
  - `hooks/useListingFilters.js`
  - `hooks/useListingPagination.js` (gerekiyorsa)
- Kart render/perf/aksiyon:
  - `components/ListingCard.jsx`
  - `components/ListingGrid.jsx`
- API payload/normalizasyon:
  - `services/listingService.js`

### Uygulama Sırası

1. İstek hangi katmanda çözülmeli belirle (UI/hook/service).
2. Değişiklikte domain sabiti varsa önce `types/index.js` güncelle.
3. Filtre değişikliğinde `filterConfigs` ve `serializeFilters` eşleşmesini aynı adımda tamamla.
4. Kart performansında önce parent seviyede hesaplamayı değerlendir, karta sadece sonuç prop’u geçir.
5. Hook akışında yarış durumu ihtimali varsa request-id/abort koruması ekle.
6. İş bitince sadece etkilenen listing dosyalarında lint kontrolü yap.

### Kabul Kriteri

- Aynı kullanıcı girdisi ile önceki davranış bozulmamalı (geriye uyumluluk).
- Filtre payload’ında yanlış null/0 dönüşümü olmamalı.
- Arama akışında eski istek yeni sonucu ezmemeli.
- Kartta görsel bilgi güncellemeleri stale kalmamalı.

### Yasaklar

- Yeni magic number ekleme; `LISTING_DEFAULTS` dışında sabit bırakma.
- UI bileşeninde backend’e özel dönüştürme/serileştirme yapma.
- Filtre alanını sadece UI’da ekleyip service tarafını eksik bırakma.

### Hızlı İstek Şablonları (AI için)

- "X filtresini ekle":
  - Filter config + serialize + default state + status özeti kontrol et.
- "Arama bazen yanlış sonuç veriyor":
  - `useListingSearch` request-id akışını güçlendir, stale write engelle.
- "Kart güncellenmiyor":
  - `ListingCard` comparator ve parent’tan gelen prop referanslarını düzelt.
- "Yeni kategori ekle":
  - type config + filter config + form/details schema + create flow kayıtlarını birlikte tamamla.

## Mimari Özeti

- `hooks/useListingEngine.js`: çekirdek orkestrasyon katmanı. Filtre, arama, pagination ve veri çekmeyi birleştirir.
- `hooks/useListingFilters.js`: filter state, kategori geçişi, URL senkronizasyonu ve sidebar state yönetimi.
- `hooks/useListingSearch.js`: title/listingNo arama modlarını yönetir; title modunda çok sayfalı yükleme yapar.
- `services/listingService.js`: API çağrıları ve filter payload serileştirme (`serializeFilters`).
- `components/ListingsModuleLayout.jsx`: listing sayfalarının üst kapsayıcısı; navigation + sidebar + içerik kompozisyonu.
- `components/ListingsContent.jsx`: sonuç durumu, filtre özeti, grid/pagination render.
- `components/ListingGrid.jsx`: kart grid render + showcase durumunu parent seviyede hesaplar.
- `components/ListingCard.jsx`: tekil kart UI/aksiyonları; memo comparator ile kontrollü render.

## Çekirdek Veri Akışı

1. Sayfa (`ListingsPage` / `MyListingsPage`) `useListingEngine` çağırır.
2. `useListingEngine`, `useListingFilters` ile temizlenmiş filtreleri (`cleanedFilters`) üretir.
3. `useQuery` üzerinden `listingService.filterListings` veya `listingService.getMyListings` çağrılır.
4. Gelen liste `useListingSearch` tarafından arama moduna göre daraltılır:
   - `listingNo` modu: tekil API çağrısı.
   - `title` modu: mevcut page veya tüm sayfalar.
5. `ListingsContent` sonucu gösterir; `ListingGrid` kartları render eder.

## Sorumluluk Kuralları

- Hook katmanı UI metni üretmez; sadece state + davranış döner.
- Service katmanı React bağımlılığı içermez; sadece request/serialize.
- UI bileşenleri backend alan dönüşümü yapmaz; dönüştürme service/hook seviyesinde yapılır.
- Yeni filtre alanı eklerken hem `filterConfigs` hem `serializeFilters` birlikte güncellenir.

## Son Refactor Notları (Neden Yapıldı)

- `ListingCard` comparator stale riskini azaltacak şekilde düzenlendi, çift memo kaldırıldı.
- `useShowcase` çağrısı kart başına değil `ListingGrid` seviyesine taşındı.
- `useListingSearch.loadAllPages` için request-id koruması ve üst sayfa limiti eklendi.
- Arama page size/maks sayfa gibi sabitler `LISTING_DEFAULTS` içine toplandı.
- `FilterStatus` aktif filtre sayımı tek yardımcı fonksiyona indirildi.
- `listingService.toInt` artık `0` değerini zorla `null` yapmıyor.
- `useListingEngine` nav state’i `location.state` değişimlerine duyarlı hale geldi.
- `useListingFilters` kullanıcı değişiminde gereksiz reset tetiklenmesini azaltacak şekilde korundu.

## Yeni Özellik Eklerken İzlenecek Yol

### 1) Yeni filtre alanı

- `filters/filterConfigs.js` içine alanı tanımla.
- `services/listingService.js` içindeki `serializeFilters` akışında backend karşılığını ekle.
- Gerekirse `hooks/utils/filterDefaults.js` ile başlangıç değerini tanımla.
- UI tarafında `FilterSidebar`/`FilterStatus` için ekstra özel durum gerekiyorsa sadece burada ekle.

### 2) Yeni sıralama türü

- `types/index.js` içinde `LISTING_SORT_FIELDS` alanını genişlet.
- Backend sort alanı uyumunu doğrula.
- `FilterStatus` sort toggle seçeneklerini güncelle.

### 3) Kartta yeni görsel bilgi/aksiyon

- Alan listing DTO’da zaten varsa sadece `ListingCard` renderını genişlet.
- Kartın davranışı global veriye bağlıysa (showcase gibi), mümkünse `ListingGrid` seviyesinde hesaplayıp prop geç.
- Kart comparator’ını yeni prop alanına göre güncelle.

### 4) Yeni listing type (kategori)

- `config/<type>Config.js` oluştur.
- `config/listingConfig.js` içine type kaydı ekle.
- `filters/filterConfigs.js` için type filtre şemasını ekle.
- Create/Edit formu için `GenericListingForm` şemasını (`formSchema`) tanımla.
- Details görünümü için `detailsSchema` alanlarını ekle.

## Kritik Değişiklik Yapmadan Önce Kontrol

- Değişiklik hook mu service mi UI mı? Katman sınırını ihlal etmeyin.
- Aynı domain kuralı için yeni magic number eklemeyin; `LISTING_DEFAULTS` kullanın.
- Filtre alanı eklendi ama serialize edilmedi ise backend sonucu yanıltıcı olur.
- Kart performansı için ağır hesapları kart içinde değil parent/hook seviyesinde çözün.

## Mini Runbook (Hızlı Operasyon)

### A) “Arama sonucu tutarsız” şikayeti

- `useListingSearch.js` içinde `searchMode` ve `titleSearchRequestRef` akışını kontrol et.
- Arama sırasında eski isteğin yeni sonucu ezmediğini doğrula.
- `LISTING_DEFAULTS.TITLE_SEARCH_MAX_PAGES` değerinin senaryoya uygun olduğundan emin ol.

### B) “Filtre seçili ama backend sonucu yanlış” şikayeti

- Önce `filterConfigs` alan anahtarını kontrol et.
- Sonra `serializeFilters` payload karşılığını kontrol et.
- Alanın `cleanObject` sonrası silinip silinmediğini doğrula.

### C) “Kart güncellenmiyor / stale” şikayeti

- Kartın aldığı `listing` referansı gerçekten değişiyor mu kontrol et.
- `ListingCard` comparator’ındaki prop listesini yeni davranışa göre güncelle.
- Global bağımlılık kart içinde çözüldüyse parent’a taşımayı değerlendir.

