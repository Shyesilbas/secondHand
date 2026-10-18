# Backend Güvenlik ve Mimari Denetim Raporu

> **Ortam / Altyapı Bilgisi:**
> - Redis, Kafka ve PostgreSQL Docker üzerinde çalışmaktadır.
> - Database kullanıcı adı: `postgres`, parola: `postgres`

**Tarih:** 2026-10-18  
**Kapsam:** `src/main/java/com/serhat/secondhand/` altındaki backend modülleri (31 modül, 946 dosya)

---

## 1. Adım: Yapı ve Çekirdek Akış

31 modül ve 946 dosya bulunmaktadır. Riskin yoğunlaştığı çekirdek bileşenler:
- **Para akışı:** `checkout` → `order` → `payment` → `escrow` → `ewallet`. Tek ödeme sağlayıcısı: `EWALLET`.
- **Stok:** `inventory`. Rezervasyon Redis'te Lua script ile yapılıyor, PostgreSQL'e Kafka üzerinden senkronlanıyor.
- **Kuyruk / Outbox:** 3 outbox worker (`payment`, `order`, `escrow`) Kafka'ya yazıyor; 4 consumer okuyor.
- **Güvenlik:** JWT filtresi (Bearer veya cookie), bellek içi rate limit, CSRF cookie ve STOMP interceptor.

---

## Kritik Bulgular (Para Kaybı veya Güvenlik Açığı)

### 1. Ödeme akışında kalan açıklar *(ana hata giderildi: başarısız ödeme artık `Result.error` dönüyor)*
- **Yarış Durumu:** Bakiye kontrolü kilitsiz okuyor (`PaymentProcessor.java:140`), kilit ise sonradan alınıyor (`EWalletService.java:205`). Kullanıcı aradaki pencerede paralel bir çekim (`withdraw`) ile bakiyeyi boşaltırsa Premium, vitrin ve ilan ücretini ödemeden hak kazanabilir.
- **Sepet / Rollback:** `CheckoutOrchestrator.java:112-117` üzerinde: Çok satıcılı bir sepette bir ödeme başarısız olursa genel bir rollback yapılmıyor. Başarılı kalemlerin parası düşülüyor, sipariş siliniyor ve işlem commit ediliyor.

---

## Yüksek Öncelikli Bulgular

### 7. Temiz bir veritabanında uygulama açılmıyor
- **Dosya / Satır:** `db/migration/V1__baseline.sql:526-544`
- **Detay:**
  - `escrows` tablosunda `order_item_id` yok ve `order_id` kolonu `UNIQUE` tanımlı (her kalem için ayrı escrow açıldığından çok kalemli siparişleri bozar).
  - `carts.user_id` kolonu `UNIQUE`, oysa entity kullanıcı başına birden çok satır tutuyor.
  - `users.password_hash` sütunu entity'deki `password` alanı ile eşleşmiyor.
  - `ddl-auto: validate` ayarıyla uygulama yalnızca Hibernate'in daha önce oluşturduğu eski şemalı DB'de çalışabilir durumda.

### 8. Çok satıcılı SAFE_MEETUP siparişinde tek satıcı herkesin parasını açıyor
- **Dosya / Satır:** `OrderCompletionService.java:129`, `OrderCreationService.java:211`, `EscrowService.java`
- **Detay:** `confirmHandoverCompletion` → `EscrowService.release(order)` çağrısı siparişteki tüm escrow'ları serbest bırakıyor. `OrderCreationService.java:211` ise meetup siparişini tek satıcıyla sınırlamıyor.

### 9. Üretim akışında demo kodları bulunuyor
- **Dosya / Satır:** `OrderCompletionScheduler.java:34, 58`, `EWalletService.java:94`
- **Detay:**
  - `OrderCompletionScheduler.java:34` her 5 dakikada siparişleri otomatik ilerletiyor, sahte "ARAS" takip numarası üretiyor (`:58`) ve 72 saat sonra escrow'u satıcıya serbest bırakıyor.
  - `EWalletService.java:94` deposit ("Mock top-up") herkese kontrolsüz bakiye yüklüyor.
  - Her iki akışta da profil (örn. `@Profile("!prod")`) koruması bulunmuyor.

### 10. Rezervasyonda adet kontrol edilmiyor
- **Dosya / Satır:** `resources/scripts/reserve_stock_with_ttl.lua:14-19`
- **Detay:** Mevcut bir rezervasyon varsa istenen yeni adede bakılmaksızın başarı dönüyor. Kullanıcı 1 adet rezerve edip sepette adedi 3'e çıkardığında checkout kontrolü bypass ediliyor.

---

## Orta Öncelikli Bulgular

### 11. Checkout aşamasında ilan durumu yeniden kontrol edilmiyor
- **Dosya:** `CheckoutPricingContextFactory`, `OrderCreationService.createOrder`
- **Detay:** Sepete eklendikten sonra `INACTIVE` veya `SOLD` olmuş bir ilan sipariş tamamlama aşamasında tekrar doğrulanmadığı için satın alınabiliyor.

### 12. Stok uzlaştırıcısında yarış durumu (Race Condition) ve Redis bloklama
- **Dosya / Satır:** `InventoryRedisReservationService.java:28, 87`
- **Detay:**
  - `:87` rezervasyon anahtarını hemen siliyor, ancak veritabanı düşümü asenkron yürüyor. Arada uzlaştırıcı çalışırsa Redis eski değere dönüyor.
  - `:28` satırındaki `KEYS` komutu her ilan için tekrar çağrılıyor ($O(N^2)$) ve Redis event loop'unu blokluyor.

### 13. İptal ve iadede stok yalnızca veritabanına dönüyor, Redis'e senkronlanmıyor
- **Dosya / Satır:** `OrderCompensationPersistenceService.java:59`, `ListingCommandService.java:143`
- **Detay:**
  - `OrderCompensationPersistenceService.java:59` içindeki `restoreStock`, hatayı transaction içinde `catch (Exception ignored)` ile yutuyor. İçteki `@Transactional` işlemi rollback'e işaretlediği için tüm iptal `UnexpectedRollbackException` ile 500 hatası veriyor.
  - Satıcının stok güncellemesi de (`ListingCommandService.java:143`) Redis'e yansıtılmıyor; `syncStockToRedis` hiç çağrılmıyor.

### 14. Meetup zamanlayıcısı takılıyor
- **Dosya / Satır:** `OrderCompletionScheduler.java:137`
- **Detay:** Kısmen iptal edilmiş bir siparişte escrow iptali sürekli başarısız oluyor; sipariş sonsuza kadar bekliyor ve kalan para iade edilmiyor.
- `VERIFICATION_LOCKED` durumundaki siparişleri hiçbir adım işlemiyor.
- Zamanlayıcının tamamı tek transaction'da koşuyor: Tek bir hata tüm toplu işlemi geri alır. Çoklu instance ortamında aynı anda çalışmayı önleyen dağıtık kilit mekanizması da bulunmuyor.

### 15. Outbox'larda yeniden deneme limiti etkisiz
- **Dosya / Satır:** `EscrowOutboxWorker.java:79`, `PaymentOutboxWorker.java:74`, `OrderOutboxWorker.java:62`
- **Detay:** Limit dolunca kaydı `FAILED` yapıyor; ancak worker sorgusu `FAILED` kayıtları da tekrar çekiyor. Hatalı bir mesaj sonsuz döngüye giriyor. Çoklu instance desteği için `SKIP LOCKED` eksik.

### 16. İdempotency kayıtları erken siliniyor
- **Dosya / Satır:** `OutboxHousekeepingScheduler.java:32`
- **Detay:** Tekrar korumasını (idempotency) 3 gün tutuyor. Oysa Kafka 7 gün saklıyor ve tüketici en baştan okuyacak şekilde yapılandırılmış. Offset sıfırlanırsa eski escrow kredileri mükerrer yazılabilir.

### 17. Ödeme, commit'ten önce "tamamlandı" olarak işaretleniyor
- **Dosya / Satır:** `PaymentProcessor.java:83, 89`
- **Detay:** Redis'teki kaydı checkout işlemi commit olmadan tamamlandı olarak işaretliyor. Ayrıca `:89` üzerindeki iyimser kilit yeniden deneme döngüsü ölü kod niteliğinde.

### 18. Kupon kullanım hakkı boşa yanıyor
- **Dosya / Satır:** `CouponService.java:123`
- **Detay:** Redis sayacını veritabanı doğrulamasından önce artırıyor ve rollback durumunda geri almıyor; başarısız checkout işlemleri limiti tüketiyor. Veritabanı zaten pesimistik kilit kullandığı için Redis sınırlayıcısı gereksiz yük ve risk oluşturuyor.

### 19. Herkes istediği hesabı kilitleyebilir (DoS)
- **Dosya / Satır:** `LoginAttemptService.java:15`
- **Detay:** Sayaç bellek içi, instance başına ve sınırsız büyüyor. Anahtar olarak e-postanın kendisi kullanılıyor; büyük/küçük harf değiştirilerek kilit atlatılabiliyor veya rastgele kullanıcıların hesapları kilitlenebiliyor.

### 20. PublicEndpointRegistry değişkenli path'leri kaydetmiyor
- **Dosya / Satır:** `PublicEndpointRegistry.java:76`
- **Detay:** Spring Boot 3.5'te `getDirectPaths()` bu path'ler için null yerine boş küme dönüyor. Bu yüzden `{id}` içeren public endpoint'ler registry'ye public olarak eklenemiyor ve misafir kullanıcılar 401 alıyor. Kayıt ayrıca HTTP metodundan bağımsız. *(Uygulama çalıştırılarak doğrulanmalı)*.

### 21. Yönetim ve maliyet uçları yetkilendirilmemiş
- **Dosya / Satır:** `AgreementController.java:46` (`POST /initialize`), `GeminiController.java:30` (`POST /ask`)
- **Detay:** Herhangi bir kullanıcı yönetimsel ilklendirme endpoint'ini veya LLM maliyetine yol açan AI endpoint'ini kısıtlama olmaksızın tetikleyebiliyor.

### 22. WebSocket bağlantısı iptal edilmiş token'ı kabul ediyor
- **Dosya / Satır:** `WebSocketSecurityConfig.java:92`
- **Detay:** Bağlantı esnasında refresh token kabul edilebiliyor ve iptal (revocation) kontrolü yapılmıyor; iptal edilmiş 30 günlük token dahi bağlantı sağlayabiliyor.

### 23. Token yenilemede eşzamanlılık kilidi yok
- **Dosya / Satır:** `LoginService.java:112` (`refreshToken`)
- **Detay:** Eski token'ı kilitlemiyor. Çoklu sekmede eşzamanlı token yenileme isteği geldiğinde ya iki geçerli token üretilir ya da yarış nedeniyle kullanıcı sistemden düşürülür.

---

## Düşük Öncelikli / Kod Temizliği (Dead Code)

- **Hata Argümanları Sırası Ters:** `Result.error(mesaj, kod)` çağrıları `CheckoutOrchestrator.java:70, 78, 90, 116` ve `CouponService.java:78, 84, 101, 107` sınıflarında ters argümanlarla verilmiş; istemci mesaj yerine hata kodunu görüyor.
- **Ölü Kodlar:**
  - Redis teklif kilidi işlevsiz: `OfferService.java:132` `lockAcceptedOffer` sonucunu yoksayıyor, `releaseAcceptedOffer` hiç çağrılmıyor.
  - `EscrowService.java:259` `creditWalletQuietly` metodu hiçbir yerden çağrılmıyor.
  - `reserveStock` ve `syncStockToRedis` metotları kullanılmıyor.
  - `ORDER_CANCELLED` ve `ORDER_REFUNDED` topic'lerini tüketen bir consumer yok.
  - `PAYMENT_FAILED` ve `PAYMENT_REFUNDED` topic'lerine yazan bir producer yok.
- **WebSocket Bildirimleri:** `NotificationWebSocketService.java:18` adresi `/user/{id}` ile kuruyor, oysa Spring kullanıcıyı e-postasından (Principal) çözüyor. *(Doğrulanmalı)*.
- **Kafka Deserialize Güvenliği:** `KafkaConfig.java:41` tüm paketlere güveniyor (`"*"`). Kafka'ya mesaj yazabilen bir aktör rastgele sınıf deserialization zafiyeti tetikleyebilir.
- **"Sepette N kişi" Metrik Şişmesi:** `CheckoutOrchestrator.java:170` sepeti temizlerken bu metriği düşürmüyor.
- **Çift Bildirim Gönderimi:** `EscrowService.java:139` ve Kafka consumer aynı ödeme için iki kez "ödeme başarılı" bildirimi gönderiyor.

---

## Önerilen Çözüm Sırası

1. **Adım 1 (Acil / En Yüksek Risk - Düşük Efor):** `1` (kalan yarış durumu ve sepet rollback'u).
3. **Adım 3 (Veritabanı & Migration Sağlığı):** `7` (`V1__baseline.sql` düzeltmeleri ve entity senkronizasyonu).
4. **Adım 4 (İş Kuralı ve Mimari Kararlar):** `8, 9` (Çok satıcılı sipariş akışı ve demo / mock kodların profil koruması altına alınması).
5. **Adım 5 (Dayanıklılık ve Temizlik):** Geriye kalan orta ve düşük öncelikli bulgular.

---

## Ek Notlar ve Doğrulama Durumu

- **Doğrulama İhtiyacı:** `listing` modülünde (150 dosya) yalnızca temel sahiplik kontrolleri taranmıştır; forum, review, notification, ai, dashboard ve follow servisleri derinlemesine analiz edilmemiştir.
- **Çalışma Zamanı Doğrulaması:** 20. bulgu (`PublicEndpointRegistry` Boot 3.5 davranış uyumu) ve WebSocket bildirimlerinin adresi (`NotificationWebSocketService`) çalışan uygulama üzerinde doğrulanmalıdır.
