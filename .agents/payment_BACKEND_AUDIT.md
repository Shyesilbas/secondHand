# Payment Paket Backend Audit
_Tarih: 2026-06-21_

## Genel Değerlendirme
Ödeme (`payment`) paketi, genel hatlarıyla oldukça sağlam, modüler ve olay güdümlü (event-driven) bir mimariye sahiptir. İdempotency (tekrarlanabilirlik) mekanizması Redis ve optimistic locking ile çift kademeli olarak kurulmuş, Dağıtık işlem sorunlarını aşmak ve tutarlılığı sağlamak için **Outbox Pattern** (PaymentOutboxWorker) kullanılmıştır. Sorumluluklar `PaymentProcessor`, `OrderPaymentService` ve Handler'lar arasında temiz bir şekilde bölünmüş, "God Object" anti-pattern'inden kaçınılmıştır.

## Sınıf Haritası
| Katman | Sınıflar | Adet | Yorum |
|--------|----------|------|-------|
| Controller | `PaymentController` | 1 | Çok ince (thin). İdempotency ve JWT (AuthenticationPrincipal) kullanarak gelen istekleri direkt processor'a iletiyor. |
| Service | `PaymentProcessor`, `OrderPaymentService`, `PaymentStatsService`, vb. | 10+ | Görev ayrımı çok iyi yapılmış. Toplu işlemler `OrderPaymentService`'de, core işlem `PaymentProcessor`'da, onay/bildirim işleri handler'larda. |
| Repository | `PaymentRepository`, `PaymentOutboxRepository` | 2 | Veritabanı erişimi. `PaymentRepository`'de karmaşık sorgular bulunuyor. |
| Validator/Policy | `PaymentValidator` | 1 | Anlaşma (Agreement) kabullerini `AgreementRequirementService` üzerinden merkezi denetliyor. |
| Mapper | `PaymentMapper` | 1 | MapStruct kullanılıyor. Bazı mantıksal birleştirmeler (`getDisplayName`) interface içerisinde `default` metod olarak yazılmış. |
| Event/Listener | `PaymentOutboxWorker`, `PaymentCompletedEventListener`, `Handlers` | 5+ | Outbox Worker asenkron ve güvenilir teslimat sağlıyor. Handler'lar `PaymentCompletionDispatcher` üzerinden yönlendiriliyor. |

## Tespit Edilen Sorunlar
| Sorun | Sınıf/Katman | Risk | Çözüm Önerisi |
|-------|-------------|------|---------------|
| Cache Invalidation | `PaymentProcessor` (`executePaymentWithTransaction`) | Orta | `@CacheEvict(value = "paymentStats", allEntries = true)` tüm kullanıcıların önbelleğini temizliyor. Performans kaybına neden olabilir. Sadece ilgili kullanıcının cache'i (`key = "#userId"`) temizlenmeli. |
| Karmaşık Arama Sorgusu | `PaymentRepository` (`findByFilters`) | Orta | Çok fazla `OR` ve `LOWER(CONCAT(...))` içeren sorgular tablolar büyüdüğünde full table scan yapabilir ve performansı ciddi düşürebilir. Full Text Search aracı veya ElasticSearch düşünülmeli. |
| Entity Doğrudan Outbox'a Gidiyor | `PaymentProcessor` | Düşük | `paymentOutboxService.enqueuePaymentCompleted(payment)` metoduna Entity geçiliyor. Outbox payload'u olarak sadece Payment ID saklanıp işleneceği için sorun yaratmaz ancak doğrudan DTO geçilmesi daha güvenli bir pattern olabilir. |
| Manuel Rollback | `OrderPaymentService` (`processPaymentBatch`) | Düşük | Toplu işlemlerde döngü içindeki bir ödeme hata verirse `setRollbackOnly` manuel çağrılıyor. Doğru kurgulanmış ama try-catch ile exception fırlatarak spring'e rollback yaptırmak (`@Transactional`) daha idiomatic olabilir. |

## Katman Analizi

### Controller
Çok ince (thin) yapıda. Sadece HTTP katmanı ile ilgileniyor. Idempotency Key başlık (header) üzerinden kontrol ediliyor ve iş mantığı `PaymentProcessor`'a devrediliyor.

### Service
Sorumluluklar mükemmel dağıtılmış. `PaymentProcessor`, transaction ve retry/lock yönetimini üstlenirken `OrderPaymentService` iş akışını (e-wallet bakiye kontrolü, ödeme listesi validasyonu) yönetiyor. God Object oluşumu engellenmiş.

### Validasyon
`PaymentValidator` doğrudan iş mantığı kurallarını (`AgreementRequirementService` bağımlılığı ile) kontrol ediyor. Controller seviyesinde ise `@Valid` kullanılarak sadece payload yapısı (DTO kısıtlamaları) kontrol ediliyor.

### Repository
`N+1` sorunu riskine karşı `JOIN FETCH` ifadeleri kullanılmış (`LEFT JOIN FETCH p.fromUser` vb.). Ancak `findByFilters` altındaki çoklu `LIKE` ve `OR` kullanımı teknik borç olarak birikmeye açık.

### Mapper
MapStruct ile otomatize edilmiş (`@Mapper(componentModel = "spring")`). DTO-Entity ayrımı tam olarak sağlanmış. 

### Event/Async
Spring Scheduler ile Outbox modeli kurulmuş. `PaymentOutboxWorker` başarısız işleri `REQUIRES_NEW` transaction ile izole ederek her eventi bağımsız retry ediyor ve ana sistemi kitlemiyor. Loose coupling başarıyla uygulanmış.

## Transaction & Güvenlik Riski
Ödeme, e-cüzdan ve escrow alanında büyük riskleri barındıran bu modülde `PaymentRedisIdempotencyService` ile mükemmel bir koruma sağlanmış. Redis kilitleri `CLAIM`, `CONFLICT`, `IN_PROGRESS` gibi state'lerle race condition'ları engelliyor. Optimizistic locking kullanımı ile concurrency (eşzamanlılık) kaynaklı olası veri kayıpları/çakışmalar için de retry mekanizması (`MAX_OPTIMISTIC_LOCK_RETRIES`) işletiliyor. Güvenlik ve veri bütünlüğü yüksek seviyede.

## Cache Kullanımı
Paket `paymentStats` cache'ini kullanıyor. Ancak transaction sonrasında `@CacheEvict` ile tüm kayıtların `allEntries = true` olarak temizlenmesi, sistemde ölçeklenme aşamasında performans zafiyeti yaratacaktır. Cache evict'in sadece ilgili `userId` ile sınırlandırılması gerekir.

## README Durumu
Bu paketin spesifik bir README.md dosyası var mı emin değilim, modül içi kurallar genel `GEMINI.md` ve `.agents` prensipleriyle hizalı görünüyor.

## Öncelik Sırası
1. **[Orta - Teknik Borç]** Cache Invalidation: `PaymentProcessor` içindeki `@CacheEvict` tüm cache'i (allEntries=true) temizliyor. Ölçeklenmede sistem geneli cache miss oranını artırır. Key bazlı yapıya geçilmeli.
2. **[Orta - Teknik Borç]** Veritabanı Performansı: `PaymentRepository.findByFilters` metodunda arama sorgusunun performans optimizasyonu.
3. **[Kozmetik]** Exception Yönetimi: `OrderPaymentService`'de manuel olarak `setRollbackOnly` yerine custom bir RuntimeException fırlatılması düşünülebilir.

## Genel Skor
| Kategori | Puan (1-5) |
|----------|-----------|
| Katman Ayrımı | 5 |
| Transaction Yönetimi | 5 |
| Validasyon | 5 |
| Kod Tekrarı | 4 |
| Dokümantasyon | 4 |
| **Ortalama** | **4.6 / 5.0** |
