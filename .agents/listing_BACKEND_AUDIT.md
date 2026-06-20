# listing Backend Audit
_Tarih: 2026-06-20_

## Genel Değerlendirme
`listing` paketi mükemmel bir modüler yapıya sahip. Sorumluluk ayrımı (Separation of Concerns) katmanlar arasında çok net çizilmiş. Farklı ilan tipleri (realestate, vehicle, clothing, electronics, books, sports) için kendi validatörleri, entity'leri ve servisleri ayrılmış durumda. Ortak ilan işlemleri (yaratma, silme, güncelleme, sorgulama) ise `ListingCommandService` ve `ListingQueryService` gibi temel servislerde toplanmış. Polymorphism kullanılarak "AbstractListingService" üzerinden her ilan tipine özel davranışlar başarıyla implemente edilmiş.

## Sınıf Haritası
| Katman | Sınıflar | Adet | Yorum |
|--------|----------|------|-------|
| Controller | ListingController, VehicleListingController vb. | 11 | İnce yapıda, sadece HTTP yönlendirmesi yapıyor. |
| Service | ListingCommandService, AbstractListingService vb. | 20 | Domainlere (araç, emlak) ve read/write işlemlerine göre ayrılmış. |
| Repository | ListingRepository, VehicleListingRepository vb. | 32 | Entity bazlı iyi bir ayrım yapılmış. |
| Validator/Policy | CategorySpecValidator, VehicleHierarchyValidator vb. | 31 | Çok başarılı bir policy-driven doğrulama mimarisi kurulmuş. |
| Mapper | ListingMapper, PriceHistoryMapper | 2 | DTO-Entity dönüşümleri güvenli bir şekilde sağlanıyor. |
| Event/Listener | PriceDropNotificationListener vb. | 3 | Loosely coupled bir mimari ile fiyat düşüşleri ve yeni ilanlar dinleniyor. |

## Tespit Edilen Sorunlar
| Sorun | Sınıf/Katman | Risk | Çözüm Önerisi |
|-------|-------------|------|---------------|
| Eager Fetch Kullanımı | `BookGenre.java` ve `VehicleModel.java` (Domain) | Düşük | `@ManyToOne` ve `@ElementCollection` eager fetch kullanıyor. İleride N+1 sorunu yaratmamasına dikkat edilmeli, `LAZY` kullanılıp `EntityGraph` ile çekilebilir. |
| Cache İsimlendirmesi | `ListingCommandService.java` (Service) | Düşük | Sınıf `@CacheConfig(cacheNames = "userProfile")` anotasyonu ile işaretlenmiş. İlan değişince userProfile etkileniyor olabilir, ancak bu bağımlılık açıkça belirtilmeli. |
| İlan Bağımlılıkları | `RealEstateListingService` vb. (Service) | Orta | Alt domain servisleri giderek büyüyebilir, logic'in `AbstractListingService` ile dengeli dağıldığından emin olunmalı. |

## Katman Analizi

### Controller
Çok temiz ("Thin"). İş mantığı kesinlikle sızmamış. İstekler `ListingCommandService` ve `ListingQueryService`'e gönderiliyor. Bütün HTTP endpoint'leri domain objesi yerine `ListingDto`, `ListingFilterDto` kullanıyor.

### Service
Read ve Write modelleri servis katmanında CQRS mantığına benzer şekilde (`ListingQueryService` vs `ListingCommandService`) ayrılmış. God Object oluşumu engellenmiş.

### Validasyon
Mükemmel bir validasyon hiyerarşisi var. Ortak validasyonlar `ListingValidationEngine` gibi yapılardan geçiyor, alt kategorilerin (Electronics, Books, vb.) kendilerine ait Policy ve SpecValidator'ları bulunuyor.

### Repository
Genellikle Spring Data JPA'nın yetenekleri iyi kullanılmış. Sadece birkaç referans tablosunda `FetchType.EAGER` görüldü. Büyük veri çekimlerinde `findAllByIdIn` vb. batch sorguları mevcut. 

### Mapper
Ayrı bir `Mapper` paketi altında DTO <-> Entity çevrimleri kapsüllenmiş.

### Event/Async
Spring `ApplicationEventPublisher` kullanılarak `PriceDroppedEvent` ve `NewListingCreatedEvent` fırlatılıyor, bu sayede fiyat düştüğünde bildirim gönderimi asenkron olarak loosely coupled çalışabiliyor.

## Transaction & Güvenlik Riski
`ListingCommandService` sınıf seviyesinde `@Transactional` olarak işaretlenmiş, böylece fiyat değiştirme, miktar güncelleme veya yeni ilan ekleme işlemleri veri tutarsızlığı yaratmadan çalışıyor. `ListingFeePaymentService` gibi ödeme alanlarında güvenli katmanlar korunmuş.

## Cache Kullanımı
`ListingCommandService` sınıfı `@CacheConfig(cacheNames = "userProfile")` anotasyonunu içeriyor. Kullanıcı profilindeki ilan sayılarının tutarlılığı için cache invalidation stratejisinin dikkatle izlenmesi gerekiyor.

## README Durumu
Paket içerisinde spesifik bir README göremedim (Ana README/GEMINI.md üzerinden yönetiliyor olabilir). Büyük domainler için (Listing gibi) modül seviyesinde bir `README.md` iyi olabilirdi.

## Öncelik Sırası
1. **Düşük:** Eager fetch içeren referans tablolarının durumunun incelenmesi (VehicleModel, BookGenre).
2. **Düşük:** `@CacheConfig` amacının yorum satırıyla veya dokümanda netleştirilmesi.

## Genel Skor
| Kategori | Puan (1-5) |
|----------|-----------|
| Katman Ayrımı | 5 |
| Transaction Yönetimi | 5 |
| Validasyon | 5 |
| Kod Tekrarı | 4 |
| Dokümantasyon | 3 |
| **Ortalama** | 4.4 |
