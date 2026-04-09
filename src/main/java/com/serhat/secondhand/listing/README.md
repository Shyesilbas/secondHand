# Listing Modülü - Detaylı Dokümantasyon

##  Paket Yapısı ve Sorumluluklar

###  `api/` - REST API Katmanı (9 dosya)

**Sorumluluk:** HTTP isteklerini karşılar, DTO validasyonu yapar, application katmanına delege eder.

#### Ana Controller
- **`ListingController`**: Genel ilan operasyonları
  - CRUD işlemleri (create, update, delete)
  - Arama ve filtreleme
  - İlan yayınlama, deaktive etme
  - İstatistik sorgulama
  - Listing fee ödeme akışı

#### Kategori-Özel Controller'lar
- **`VehicleListingController`**: Araç ilanları
- **`ElectronicListingController`**: Elektronik ilanları
- **`BooksListingController`**: Kitap ilanları
- **`ClothingListingController`**: Giyim ilanları
- **`RealEstateController`**: Emlak ilanları
- **`SportsListingController`**: Spor malzemeleri ilanları

#### Yardımcı Controller'lar
- **`ListingViewController`**: Görüntülenme takibi
- **`PriceHistoryController`**: Fiyat geçmişi sorgulama

---

###  `application/` - İş Mantığı Katmanı (44 dosya)

#### `application/common/` - Ortak Servisler (10 dosya)

**`ListingCommandService`** (Write Operations)
- İlan yayınlama (`publish`)
- İlan deaktive etme (`deactivate`)
- İlan reaktive etme (`reactivate`)
- Satıldı olarak işaretleme (`markAsSold`)
- İlan silme (`deleteListing`)
- Toplu fiyat/miktar güncelleme (`updateBatchPrice`, `updateBatchQuantity`)
- Listing fee hesaplama (`calculateTotalListingFee`)
- **Transaction yönetimi:** Sınıf seviyesinde `@Transactional`

**`ListingQueryService`** (Core Read Operations)
- ID ile ilan sorgulama (`findById`, `findByIdAsDto`)
- Çoklu ID ile sorgulama (`findByIds`, `findAllByIds`)
- Kullanıcının ilanları (`getMyListings`, `getMyListingsByStatus`)
- Durum bazlı sorgulama (`findByStatusAsDto`)
- **Zenginleştirme:** Review, favorite, campaign bilgileri ekleme
- **Async işlemler:** View statistics paralel yükleme

**`ListingValidationService`**
- Sahiplik doğrulama (`findAndValidateOwner`)
- Durum doğrulama (`validateStatus`, `validateEditableStatus`)
- Miktar doğrulama ve güncelleme (`applyQuantityUpdate`)

**`ListingEnrichmentService`**
- Favori bilgisi ekleme
- Review istatistikleri ekleme
- Kampanya fiyatlandırması ekleme
- **Toplu işlem:** Liste ve sayfa zenginleştirme

**`ListingViewService`**
- Görüntülenme takibi (`trackView`)
- **Async:** `@Async` ile asenkron kayıt
- **Duplicate kontrolü:** 1 saat içinde aynı kullanıcı/session
- **IP hashleme:** Güvenlik için SHA-256
- İstatistik sorgulama (`getViewStatistics`, `getAggregatedViewStatisticsForSeller`)
- **Optimizasyon:** Tek CTE query ile tüm istatistikler

**`PriceHistoryService`**
- Fiyat değişikliği kaydetme (`recordPriceChange`)
- **AOP entegrasyonu:** `@TrackPriceChange` ile otomatik kayıt
- **Bildirim:** Fiyat düşünce favori kullanıcılarına bildirim
- Geçmiş sorgulama (`getPriceHistoryByListingId`, `getLatestPriceChange`)
- **Optimizasyon:** LIMIT 1 ile son kayıt

**`ListingPaymentHandler`**
- Listing fee ödeme tamamlandığında tetiklenir
- İlanı otomatik yayınlar
- **Event-driven:** Payment modülü ile gevşek bağlantı

**`ListingFeePaymentService`**
- Listing fee ödeme akışı
- Ödeme doğrulama
- **Port/Adapter:** `ListingFeePaymentPort` kullanır

**`ListingEventListener`** (Silindi - Boş sınıftı)

#### `application/query/` - Query Servisleri (2 dosya) ✨ YENİ

**`ListingSearchService`**
- Kategori bazlı filtreleme (`filterByCategory`)
- Global arama (`globalSearch`)
- **Strategy Pattern:** Her kategori için ayrı filter stratejisi
- **Lazy loading:** Circular dependency önleme

**`ListingStatisticsService`**
- Global istatistikler (`getGlobalListingStatistics`)
- Dashboard entegrasyonu

#### `application/category/` - Kategori Servisleri (1 dosya)

**`AbstractListingService<T, C>`** (Template Method Pattern)
- **Template method:** `createListing` - Tüm kategoriler için ortak akış
- **Template method:** `performUpdate` - Update için ortak akış ✨ YENİ
- **Hook methods:** 
  - `mapRequestToEntity`
  - `resolveEntities`
  - `applyResolution`
  - `validate`
  - `save`
- **Validation delegates:** Ownership, status, quantity kontrolü

#### `application/vehicle/` - Araç Servisleri (5 dosya)

**`VehicleListingService`**
- Araç ilanı oluşturma
- Araç ilanı güncelleme
- Marka/model bazlı arama
- Filtreleme

**`VehicleListingResolver`**
- VehicleType, Brand, Model lookup
- İlişkili entity'leri çözümler

**`VehicleResolution`**
- Çözümleme sonuç DTO'su

**`VehicleFilterPredicateBuilder`**
- JPA Criteria API ile dinamik filtre oluşturma
- Marka, model, yıl, yakıt tipi vb. filtreler

**`VehicleDataInitializer`**
- Seed data yükleme

#### Diğer Kategori Servisleri (Benzer Yapı)
- `application/books/` - Kitap servisleri (5 dosya)
- `application/clothing/` - Giyim servisleri (5 dosya)
- `application/electronics/` - Elektronik servisleri (5 dosya)
- `application/realestate/` - Emlak servisleri (5 dosya)
- `application/sports/` - Spor servisleri (5 dosya)

#### `application/filter/` - Filtreleme (3 dosya)

**`GenericListingFilterService<T, F>`**
- **Criteria API:** Dinamik query oluşturma
- **N+1 çözümü:** `root.fetch("seller")` 
- **Kategori özel fetch:** Brand, model, type için dinamik fetch 
- Sayfalama ve sıralama
- Count query optimizasyonu

**`FilterPredicateBuilder<T, F>`**
- Interface: Kategori özel filtre kuralları

**`FilterHelper`**
- Ortak filtre işlemleri
- Sayfalama başlatma
- Base predicate'ler (status, price range, location)

#### `application/port/` - Port Interfaces (1 dosya)  

**`ListingFeePaymentPort`**
- Payment modülü ile sözleşme
- `processListingFee`: Ödeme işleme
- `isPaymentCompleted`: Ödeme durumu kontrolü
- **Hexagonal Architecture:** Bağımlılık tersine çevirme

---

###  `domain/` - Domain Katmanı (119 dosya)

#### `domain/entity/` - Entity'ler (48 dosya)

**`Listing`** (Ana Entity) ✨ RICH DOMAIN
- **Rich domain methods:**
  - `publish()`: İlan yayınlama + validasyon
  - `deactivate()`: Deaktive etme + validasyon
  - `reactivate()`: Reaktive etme + validasyon
  - `markAsSold()`: Satıldı işaretleme + validasyon
  - `updatePrice()`: Fiyat güncelleme + validasyon
  - `updateQuantity()`: Miktar güncelleme + validasyon
  - `markFeeAsPaid()`: Fee ödendi işaretleme
- **Query methods:**
  - `isOwnedBy(userId)`: Sahiplik kontrolü
  - `isEditable()`: Düzenlenebilir mi?
  - `canBePublished()`: Yayınlanabilir mi?
- **Validation methods:** Private, entity içinde iş kuralları
- **JPA callbacks:** `@PrePersist`, `@PreUpdate`
- **Inheritance:** `JOINED` stratejisi

**Kategori Entity'leri** (Listing'den türer)
- `VehicleListing`: Araç özel alanlar (brand, model, year, mileage, fuel)
- `BooksListing`: Kitap özel alanlar (author, ISBN, publisher, genre)
- `ClothingListing`: Giyim özel alanlar (brand, size, color, condition)
- `ElectronicListing`: Elektronik özel alanlar (brand, model, RAM, storage)
- `RealEstateListing`: Emlak özel alanlar (sqm, rooms, heating)
- `SportsListing`: Spor özel alanlar (discipline, equipment type)

**`ListingView`**
- Görüntülenme kayıtları
- User/session tracking
- IP hash (güvenlik)
- User agent bilgisi

**`PriceHistory`**
- Fiyat değişiklik geçmişi
- Eski/yeni fiyat
- Değişiklik nedeni
- Yüzde değişim

#### `domain/entity/enums/` - Enum'lar (Kategorilere göre)

**Common Enums:**
- `ListingStatus`: DRAFT, ACTIVE, INACTIVE, SOLD, RESERVED
- `ListingType`: VEHICLE, BOOKS, CLOTHING, ELECTRONICS, REAL_ESTATE, SPORTS
- `Currency`: TRY, USD, EUR

**Kategori Özel Enums:**
- `vehicle/`: FuelType, TransmissionType, BodyType, VehicleCondition
- `books/`: BookGenre, BookCondition, BookFormat, BookLanguage
- `clothing/`: ClothingSize, ClothingColor, ClothingCondition, ClothingGender
- `electronic/`: ElectronicBrand, ProcessorType, ScreenSize
- `realestate/`: HeatingType, RealEstateType, ListingOwnerType
- `sports/`: SportDiscipline, SportCondition, SportEquipmentType

#### `domain/entity/events/` - Domain Events (1 dosya)

**`NewListingCreatedEvent`**
- İlan yayınlandığında tetiklenir
- Spring ApplicationEvent extend eder
- Follow modülü dinler (yeni ilan bildirimi)

#### `domain/dto/` - Data Transfer Objects (40 dosya)

**Request DTO'ları:**
- `common/BaseListingCreateRequest`: Ortak oluşturma alanları
- `common/BaseListingUpdateRequest`: Ortak güncelleme alanları
- `vehicle/VehicleCreateRequest`: Araç özel request
- `vehicle/VehicleUpdateRequest`: Araç güncelleme
- `listing/UpdateBatchPriceRequest`: Toplu fiyat güncelleme
- `listing/UpdateBatchQuantityRequest`: Toplu miktar güncelleme
- `listing/TrackViewRequest`: Görüntülenme kayıt
- `listing/ListingFeePaymentRequest`: Listing fee ödeme  YENİ

**Response DTO'ları:**
- `listing/ListingDto`: Genel ilan DTO (tüm kategoriler için)
- `vehicle/VehicleListingDto`: Araç özel DTO
- `listing/ListingStatisticsDto`: İstatistik DTO
- `listing/ListingViewStatsDto`: Görüntülenme istatistikleri
- `common/ModelDto`, `LookupDto`: Lookup DTO'ları

**Filter DTO'ları:**
- `listing/ListingFilterDto`: Base filter
- `vehicle/VehicleListingFilterDto`: Araç filtreleri
- Her kategori için özel filter DTO

#### `domain/repository/` - Repository Interfaces (29 dosya)

**`listing/ListingRepository`**  OPTİMİZE
- **N+1 çözümü:** `@EntityGraph(attributePaths = {"seller"})` 
- **Cache:** İstatistik metotlarına `@Cacheable` 
- **Pagination:** Tüm liste metotlarında `Pageable`
- **Duplicate silindi:** `findByIdsWithSeller` kaldırıldı 
- JPQL queries: Search, seller-based, status-based
- Bulk updates: `updateQuantityBatch`, `updatePriceBatch`
- Statistics: `getTotalListingCount`, `getActiveCountsByType`

**`listing/ListingViewRepository`**
- **Optimizasyon:** Tek CTE query ile tüm istatistikler 
- `getViewStatisticsWithDailyBreakdown`: Total + unique + daily breakdown
- Duplicate kontrolü: `existsByListingIdAndUserIdAndViewedAtAfter`
- Aggregated stats: Seller bazlı istatistikler

**`PriceHistoryRepository`**  OPTİMİZE
- **Optimizasyon:** `findFirstByListingIdOrderByChangeDateDesc` LIMIT 1 
- Duplicate metotlar temizlendi 
- Tarih bazlı sorgular

**Kategori Repository'leri:** ✨ OPTİMİZE
- `vehicle/VehicleListingRepository`: `@EntityGraph` + `Pageable` 
- `clothing/ClothingListingRepository`: `@EntityGraph` + `Pageable` 
- `electronics/ElectronicListingRepository`: `@EntityGraph` + `Pageable` 
- `books/BooksListingRepository`
- `realestate/RealEstateRepository`
- `sports/SportsListingRepository`

**Lookup Repository'leri:** ✨ CACHE
- `vehicle/CarBrandRepository`: `@Cacheable("brands")` 
- `vehicle/VehicleTypeRepository`: `@Cacheable("vehicleTypes")` 
- `books/BookGenreRepository`: `@Cacheable("bookGenres")` 
- `electronics/ElectronicTypeRepository`: `@Cacheable("electronicTypes")` 
- `clothing/ClothingTypeRepository`: `@Cacheable("clothingTypes")` 
- Ve diğer lookup'lar (model, format, condition vb.)

#### `domain/mapper/` - MapStruct Mappers (2 dosya)

**`ListingMapper`** (Abstract)
- Entity ↔ DTO dönüşümleri
- `toDynamicDto`: Polimorfik mapping (runtime type'a göre)
- Kategori özel mapping'ler: `toVehicleDto`, `toBooksDto` vb.
- Create/Update mapping'ler
- **MapStruct:** Compile-time code generation

**`PriceHistoryMapper`**
- PriceHistory ↔ PriceHistoryDto

---

###  `validation/` - Validation Katmanı (30 dosya)

#### `validation/common/` - Ortak Validation (3 dosya)

**`ListingValidationEngine`**
- **Chain of Responsibility:** Validator zinciri
- `cleanupAndValidate`: Tüm validator'ları çalıştır
- Kategori özel validator'ları inject eder

**`CategorySpecValidator`**
- Interface: Kategori özel validation kuralları

**`ListingFeePaymentValidation`**
- Listing fee ödeme validasyonu
- Duplicate ödeme kontrolü

#### Kategori Validation (6 klasör × ~5 dosya)

**`vehicle/`**
- `VehicleSpecValidator`: Genel araç validasyonu
- `CarValidator`: Araba özel kurallar
- `MotorcycleValidator`: Motosiklet özel kurallar
- `TruckValidator`: Kamyon özel kurallar

**Diğer Kategoriler:**
- `books/`: Kitap validasyonları
- `clothing/`: Giyim validasyonları
- `electronics/`: Elektronik validasyonları (SmartphoneValidator, LaptopValidator)
- `realestate/`: Emlak validasyonları (HouseValidator, ApartmentValidator)
- `sports/`: Spor malzemesi validasyonları

---

###  `detail/` - Detail Strategy (8 dosya)

**`ListingDetailService`**
- **Strategy Pattern:** Kategori bazlı detay üretimi
- ✨ **Optimizasyon:** Listing parametresi ile double fetch önlendi

**`ListingDetailStrategy`** (Interface)
- `getDetailSummary(Listing)`: Detay metni üret ✨ Parametre değişti
- `supports(ListingType)`: Kategori desteği

**Strategy Implementasyonları:**
- `CarDetailStrategy`: "Bu araç BMW 3.20i 2020 model, 50000 KM'de..."
- `BookDetailStrategy`: "Bu kitap Orhan Pamuk yazarlıdır, 2023 basım..."
- `ClothingDetailStrategy`: "Bu ürün Nike marka, t-shirt, siyah renkli..."
- `ElectronicDetailStrategy`: "Bu ürün bir Apple iPhone 14. Özellikler: Smartphone, 8GB RAM..."
- `RealEstateDetailStrategy`: "Bu gayrimenkul 120 m², 3 odalı, 2 banyolu..."
- `SportsDetailStrategy`: "Bu spor ürünü futbol için top, yeni kondisyondadır."

---

###  `aspect/` - AOP (2 dosya)

**`PriceHistoryAspect`**
- **AOP:** Fiyat değişikliklerini otomatik yakalar
- `@TrackPriceChange` annotation'ını dinler
- Method execution sonrası fiyat geçmişi kaydeder
- **Exception handling:** Hata durumunda ana akışı etkilemez

**`TrackPriceChange`** (Annotation)
- `reason`: Değişiklik nedeni

---

###  `util/` - Yardımcı Sınıflar (7 dosya) YENİ

**`ListingBusinessConstants`**
- İş kuralı sabitleri
- View duplicate window, page size'lar
- Listing types excluded from reviews

**`ListingErrorCodes`** (Enum)  
- `LISTING_NOT_FOUND`
- `LISTING_FEE_NOT_PAID`
- `INVALID_STATUS_TRANSITION`  YENİ
- `INVALID_PRICE`  YENİ
- `INVALID_QUANTITY`
- `NOT_LISTING_OWNER`
- `STOCK_INSUFFICIENT`
- Ve diğerleri...

**`ListingConstants`**  YENİ
- Magic value'lar için merkezi constants
- `DEFAULT_PAGE_SIZE = 10`
- `SORT_BY_CREATED_AT = "createdAt"`
- `MSG_LISTING_NOT_FOUND = "listing.not.found"`

**`ListingNoGenerator`**
- 8 haneli unique listing numarası üretir
- Format: "L" + 7 digit random

**`ListingCampaignPricingUtil`**
- Kampanya fiyatlandırması hesaplama
- Toplu listing için kampanya bilgisi

**`ListingFavoriteStatsUtil`**
- Favori istatistikleri hesaplama
- Toplu işlem optimizasyonu

**`ListingReviewStatsUtil`**
- Review istatistikleri hesaplama
- Toplu işlem optimizasyonu

---

### 🏗️ `infrastructure/` - Altyapı Katmanı (1 dosya)  YENİ

#### `infrastructure/adapter/` - Adapter Implementasyonları

**`PaymentModuleAdapter`**  YENİ
- `ListingFeePaymentPort` implementasyonu
- **Hexagonal Architecture:** Payment modülüne tek bağlantı noktası
- DTO dönüşümleri: `ListingFeePaymentRequest` → `PaymentRequest`
- **Decoupling:** Listing modülü payment'a doğrudan bağımlı değil

---

###  `config/` - Konfigürasyon (1 dosya) YENİ

**`ListingCacheConfig`**  YENİ
- `@EnableCaching`
- Cache tanımları:
  - `brands`: Marka cache
  - `vehicleTypes`: Araç tipi cache
  - `bookGenres`: Kitap türü cache
  - `electronicTypes`: Elektronik tipi cache
  - `clothingTypes`: Giyim tipi cache
  - `listingStats`: İstatistik cache
- **SimpleCacheManager:** In-memory cache

---

##  Veri Akışları

### 1. İlan Oluşturma Akışı

```
Client Request
    ↓
VehicleListingController.createVehicleListing()
    ↓
VehicleListingService.createVehicleListing()
    ↓
AbstractListingService.createListing() [Template Method]
    ├─ userService.findById() - Satıcı doğrulama
    ├─ mapRequestToEntity() - DTO → Entity
    ├─ resolveEntities() - VehicleListingResolver
    │   ├─ VehicleTypeRepository.findById() [CACHED] ✨
    │   ├─ CarBrandRepository.findById() [CACHED] ✨
    │   └─ VehicleModelRepository.findById()
    ├─ applyResolution() - İlişkileri entity'ye set et
    ├─ validate() - ListingValidationEngine
    │   ├─ VehicleSpecValidator
    │   └─ CarValidator (eğer car ise)
    └─ save() - VehicleListingRepository.save()
        └─ @PrePersist - ListingNoGenerator ✨
    ↓
Response: UUID
```

### 2. İlan Yayınlama Akışı

```
Client Request
    ↓
ListingController.publishListing()
    ↓
ListingCommandService.publish() [@Transactional] ✨
    ↓
ListingValidationService.findAndValidateOwner()
    ├─ ListingRepository.findById()
    └─ Ownership check
    ↓
Listing.publish() [RICH DOMAIN] ✨
    ├─ validateCanPublish()
    │   ├─ Status == DRAFT?
    │   └─ isListingFeePaid == true?
    └─ status = ACTIVE
    ↓
ListingRepository.save()
    ↓
ApplicationEventPublisher.publishEvent(NewListingCreatedEvent)
    ↓
Follow Module Listener (async)
```

### 3. İlan Arama Akışı

```
Client Request
    ↓
ListingController.searchListings()
    ↓
ListingSearchService.globalSearch() [@Transactional(readOnly)] ✨
    ↓
ListingRepository.findBySearch()
    └─ JPQL: JOIN FETCH l.seller [N+1 çözümü] ✨
    ↓
ListingMapper.toDynamicDto() - Polimorfik mapping
    ↓
ListingEnrichmentService.enrich()
    ├─ CompletableFuture: Favorite bilgisi
    ├─ CompletableFuture: Review istatistikleri
    └─ CompletableFuture: Kampanya fiyatları
    ↓
Response: Page<ListingDto>
```

### 4. Kategori Filtreleme Akışı

```
Client Request (VehicleListingFilterDto)
    ↓
VehicleListingController.filterVehicles()
    ↓
VehicleListingService.filterVehicles()
    ↓
GenericListingFilterService.filter()
    ├─ Criteria API: CriteriaBuilder
    ├─ root.fetch("seller") [N+1 çözümü] ✨
    ├─ root.fetch("brand") [Kategori özel] ✨
    ├─ root.fetch("model") [Kategori özel] ✨
    ├─ VehicleFilterPredicateBuilder.buildSpecificPredicates()
    │   ├─ Brand filter
    │   ├─ Model filter
    │   ├─ Year range filter
    │   └─ Fuel type filter
    └─ Pagination + Sorting
    ↓
ListingMapper.toDynamicDto()
    ↓
ListingSearchService.enrichPage()
    ↓
Response: Page<ListingDto>
```

### 5. Fiyat Güncelleme Akışı (AOP)

```
Client Request
    ↓
VehicleListingController.updateVehicle()
    ↓
VehicleListingService.updateVehicleListing()
    [@TrackPriceChange] ✨ AOP Annotation
    ↓
AbstractListingService.performUpdate() [Template Method] ✨
    ├─ validateOwnership()
    ├─ validateEditableStatus()
    ├─ VehicleListingResolver.apply()
    ├─ ListingMapper.updateVehicle()
    └─ ListingValidationEngine.validate()
    ↓
VehicleListingRepository.save()
    ↓
[AOP After Returning]
PriceHistoryAspect.recordPriceChange()
    ├─ Fiyat değişti mi?
    ├─ PriceHistoryRepository.save()
    └─ Eğer fiyat düştüyse:
        ├─ FavoriteRepository.findUsersByListingId()
        └─ UserNotificationService.sendPriceChangeNotification()
```

### 6. Görüntülenme Takibi Akışı

```
Client Request
    ↓
ListingViewController.trackView()
    ↓
ListingViewService.trackView() [@Async] ✨
    [Asenkron çalışır, ana akışı bloklamaz]
    ├─ ListingRepository.findById()
    ├─ Seller mi? → Skip
    ├─ IP hashleme (SHA-256)
    ├─ Duplicate kontrolü (1 saat)
    │   ├─ existsByListingIdAndUserIdAndViewedAtAfter()
    │   └─ existsByListingIdAndSessionIdAndViewedAtAfter()
    └─ ListingViewRepository.save()
    ↓
[Exception handling]
    ├─ DataAccessException → Log
    └─ Generic Exception → Log
```

### 7. İstatistik Sorgulama Akışı

```
Client Request
    ↓
ListingController.getViewStatistics()
    ↓
ListingViewService.getViewStatistics()
    ├─ existsById() - Listing var mı?
    └─ ListingViewRepository.getViewStatisticsWithDailyBreakdown()
        [TEK CTE QUERY] ✨
        └─ SELECT COUNT(*), COUNT(DISTINCT ...), DATE, COUNT(*)
            GROUP BY DATE
    ↓
Response: ListingViewStatsDto
    ├─ totalViews
    ├─ uniqueViews
    ├─ periodDays
    └─ viewsByDate (Map<LocalDate, Long>)
```

### 8. Listing Fee Ödeme Akışı

```
Client Request
    ↓
ListingController.payListingFee()
    ↓
ListingFeePaymentService.processListingFee()
    ├─ ListingQueryService.findById()
    ├─ ListingValidationService.validateOwnership()
    ├─ ListingFeePaymentValidation.validate()
    └─ ListingFeePaymentPort.processListingFee() [PORT] 
        ↓
    PaymentModuleAdapter.processListingFee() [ADAPTER] 
        ├─ DTO dönüşümü: ListingFeePaymentRequest → PaymentRequest
        └─ PaymentVerificationService.processPayment()
            ↓
        [Payment Module]
            ├─ Payment processing
            └─ PaymentCompletedHandlerRegistry
                ↓
            ListingPaymentHandler.handleListingCreation()
                ├─ Listing.markFeeAsPaid() [RICH DOMAIN] 
                └─ ListingRepository.save()
```

---

## 🎯 Tasarım Desenleri

### 1. **Template Method Pattern**
- **Kullanıldığı Yer:** `AbstractListingService`
- **Amaç:** Tüm kategoriler için ortak ilan oluşturma/güncelleme akışı
- **Hook Methods:** `mapRequestToEntity`, `resolveEntities`, `validate`, `save`

### 2. **Strategy Pattern**
- **Kullanıldığı Yer:** `ListingDetailService` + `ListingDetailStrategy`
- **Amaç:** Kategori bazlı detay metni üretimi
- **Stratejiler:** `CarDetailStrategy`, `BookDetailStrategy`, vb.

### 3. **Chain of Responsibility**
- **Kullanıldığı Yer:** `ListingValidationEngine`
- **Amaç:** Validator zinciri ile adım adım doğrulama
- **Validators:** `CategorySpecValidator` implementasyonları

### 4. **Repository Pattern**
- **Kullanıldığı Yer:** Tüm `*Repository` interface'leri
- **Amaç:** Veri erişim katmanı soyutlama
- **Implementasyon:** Spring Data JPA

### 5. **Facade Pattern**
- **Kullanıldığı Yer:** `ListingQueryService`, `ListingCommandService`
- **Amaç:** Karmaşık alt sistemleri basit interface ile sunma

### 6. **Adapter Pattern** 
- **Kullanıldığı Yer:** `PaymentModuleAdapter`
- **Amaç:** Payment modülü ile listing modülü arasında köprü
- **Port:** `ListingFeePaymentPort`

### 7. **Builder Pattern**
- **Kullanıldığı Yer:** Entity'ler (`@SuperBuilder`)
- **Amaç:** Karmaşık obje oluşturma

### 8. **Observer Pattern (Event-Driven)**
- **Kullanıldığı Yer:** `NewListingCreatedEvent`
- **Amaç:** Modüller arası gevşek bağlantı
- **Listeners:** Follow module

### 9. **Aspect-Oriented Programming (AOP)**
- **Kullanıldığı Yer:** `PriceHistoryAspect`
- **Amaç:** Cross-cutting concern (fiyat geçmişi)
- **Advice:** `@AfterReturning`

### 10. **Rich Domain Model**  YENİ
- **Kullanıldığı Yer:** `Listing` entity
- **Amaç:** İş kurallarını entity içinde tutma
- **Methods:** `publish()`, `deactivate()`, `updatePrice()`, vb.

---

##  Performans Optimizasyonları

### 1. **N+1 Query Çözümü** 
- `@EntityGraph(attributePaths = {"seller"})` - Repository metotlarında
- `root.fetch("seller")` - Criteria API'de
- Kategori özel fetch'ler: brand, model, type

### 2. **Cache Stratejisi** 
- **Lookup Cache:** `@Cacheable` - brands, types, genres
- **Statistics Cache:** `@Cacheable("listingStats")`
- **Cache Manager:** SimpleCacheManager (in-memory)

### 3. **Query Optimizasyonu** 
- **View Statistics:** 4 sorgu → 1 CTE query
- **Price History:** Tüm liste → LIMIT 1
- **Detail Service:** Double fetch → Tek fetch

### 4. **Pagination** 
- Tüm liste metotlarına `Pageable` eklendi
- Memory overflow önlendi

### 5. **Async Processing** 
- View tracking: `@Async`
- Enrichment: `CompletableFuture` ile paralel

### 6. **Batch Operations**
- `updateQuantityBatch`, `updatePriceBatch`
- Toplu enrichment: `enrichList`, `enrichPage`

### 7. **DTO Projection** (Planlanan)
- Liste görünümlerinde full entity yerine projection

---

##  Mimari Prensipler

### 1. **SOLID Prensipleri**

**Single Responsibility (SRP):**
- Her servis tek sorumluluk
- `ListingQueryService` → Core queries
- `ListingSearchService` → Search & filter 
- `ListingStatisticsService` → Statistics 
- `ListingCommandService` → Write operations

**Open/Closed (OCP):**
- `AbstractListingService` - Extension için açık
- `ListingDetailStrategy` - Yeni kategori eklenebilir

**Liskov Substitution (LSP):**
- Tüm kategori entity'leri `Listing` yerine kullanılabilir
- Tüm strategy'ler `ListingDetailStrategy` yerine kullanılabilir

**Interface Segregation (ISP):**
- `CategorySpecValidator` - Küçük, odaklı interface
- `FilterPredicateBuilder` - Spesifik interface

**Dependency Inversion (DIP):** ✨
- `ListingFeePaymentPort` - Abstraction
- `PaymentModuleAdapter` - Concrete implementation
- Listing modülü payment'a bağımlı değil, port'a bağımlı

### 2. **Hexagonal Architecture (Ports & Adapters)** 
- **Port:** `ListingFeePaymentPort`
- **Adapter:** `PaymentModuleAdapter`
- **Domain:** İş kuralları entity'de
- **Infrastructure:** Adapter'lar ayrı pakette

### 3. **Domain-Driven Design (DDD)**
- **Aggregate Root:** `Listing`
- **Value Objects:** Enum'lar
- **Domain Events:** `NewListingCreatedEvent`
- **Rich Domain Model:** Entity'de iş kuralları 
- **Repository Pattern:** Veri erişim soyutlama

### 4. **Clean Architecture**
- **Domain Layer:** Entity, enum, event
- **Application Layer:** Use case'ler (servisler)
- **Infrastructure Layer:** Repository impl, adapter 
- **API Layer:** Controller'lar

### 5. **CQRS (Command Query Responsibility Segregation)**
- **Command:** `ListingCommandService` (write)
- **Query:** `ListingQueryService`, `ListingSearchService` (read) 
- Ayrı optimizasyon stratejileri



## 🎓 Genel Özet

### Listing Modülü Nedir?
Listing modülü, ikinci el ürün satış platformunun **kalbi**dir. 6 farklı kategori (Araç, Elektronik, Kitap, Giyim, Emlak, Spor) için ilan oluşturma, yönetme, arama ve görüntüleme işlemlerini yönetir.

### Temel Sorumluluklar
1. **İlan Yaşam Döngüsü:** Oluşturma → Yayınlama → Güncelleme → Deaktive/Satıldı → Silme
2. **Kategori Yönetimi:** Her kategori için özel alanlar ve validasyonlar
3. **Arama ve Filtreleme:** Global arama + kategori özel filtreler
4. **Görüntülenme Takibi:** Async, duplicate-free view tracking
5. **Fiyat Geçmişi:** AOP ile otomatik kayıt + bildirimler
6. **İstatistikler:** Dashboard için istatistikler + cache
7. **Ödeme Entegrasyonu:** Listing fee ödeme akışı

### Mimari Yaklaşım
- **Clean Architecture:** Katmanlı, bağımlılıklar içe doğru
- **Hexagonal Architecture:** Port/Adapter ile modül izolasyonu 
- **Domain-Driven Design:** Rich domain model + domain events 
- **CQRS:** Command/Query ayrımı 
- **Event-Driven:** Modüller arası gevşek bağlantı

### Performans Stratejisi
- **N+1 Çözümü:** EntityGraph + Criteria fetch 
- **Cache:** Lookup'lar + istatistikler 
- **Async:** View tracking + enrichment
- **Batch:** Toplu işlemler
- **Pagination:** Tüm liste operasyonları 


### Genişletilebilirlik
- **Yeni Kategori:** AbstractListingService extend et + validator ekle
- **Yeni Filtre:** FilterPredicateBuilder implement et
- **Yeni Detail:** ListingDetailStrategy implement et
- **Yeni Validation:** CategorySpecValidator implement et

### Entegrasyonlar
- **User Module:** Seller bilgileri
- **Payment Module:** Listing fee ödeme (Port/Adapter ile) ✨
- **Order Module:** Ilan rezervasyonu
- **Favorite Module:** Favori bilgileri
- **Review Module:** Review istatistikleri
- **Follow Module:** Yeni ilan bildirimleri (Event-driven)
- **Dashboard Module:** Global istatistikler

