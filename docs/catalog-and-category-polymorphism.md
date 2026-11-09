# Kategori Polymorphism, Dinamik Katalog ve Doğrulama Zinciri

Bu doküman, 6 vertical'daki (Emlak, Vasıta, Elektronik, Giyim, Kitap, Spor) polymorphic ilan modelini, `AbstractListingService` template akışını, `ListingValidationEngine` doğrulama sırasını ve JSON katalog verisinin yapısını açıklar. Seeding'in nasıl çalıştırıldığı için [database-migration-and-seeding-guide.md](database-migration-and-seeding-guide.md) dosyasına bakın.

---

## 1. Veri Modeli

Kategori başına ayrı alan setleri tek tabloda `JSONB` blob'una dönüştürülmez; [`Listing`](../src/main/java/com/serhat/secondhand/listing/domain/entity/Listing.java) `@Inheritance(strategy = InheritanceType.JOINED)` ile kök varlıktır ve her kategori kendi tablosuna sahip bir alt sınıftır:

```
                         Listing (ortak alanlar)
        ┌──────────┬──────────┬──────┴─────┬──────────┬──────────┐
 VehicleListing  RealEstate  Electronic  Clothing   Books     Sports
                 Listing     Listing     Listing    Listing   Listing
```

Alt sınıflar `listing/domain/entity/` altındadır: `VehicleListing`, `RealEstateListing`, `ElectronicListing`, `ClothingListing`, `BooksListing`, `SportsListing`.

---

## 2. Servis Katmanı: Template Method

[`AbstractListingService<T, C>`](../src/main/java/com/serhat/secondhand/listing/application/category/AbstractListingService.java) tüm `*ListingService` sınıflarının üst sınıfıdır. `createListing(request, sellerId)` akışı sabittir (`@Transactional`, `@CacheEvict("listing:userListings", allEntries = true)`):

1. Satıcı `userService.findById` ile yüklenir.
2. `mapRequestToEntity` → (`requiresQuantityValidation()` true ise `validateQuantity`) → `resolveEntities` / `applyResolution` (brand, type gibi FK referansları) → `preProcess`.
3. `validate(entity)`: alt sınıflar burada `listingValidationEngine.cleanupAndValidate(entity, <kategori validator listesi>)` çağırır.
4. `save(entity)`, ardından `inventoryService.createInventory(id, quantity ?? 1)`.

Güncelleme için `performUpdate(...)` sırası: ownership → finder → `isEditable()` (değilse `INVALID_LISTING_STATUS`) → resolver → updater → validator → save. Alt sınıfların doldurduğu abstract metotlar: `getListingType`, `mapRequestToEntity`, `resolveEntities`, `applyResolution`, `validate`, `save`, `extractQuantity`.

---

## 3. Doğrulama: `ListingValidationEngine`

[`ListingValidationEngine.cleanupAndValidate`](../src/main/java/com/serhat/secondhand/listing/validation/common/ListingValidationEngine.java) ilk hatada durur ve şu sırayı izler:

1. `listing == null` → `LISTING_REQUIRED`.
2. `LocationValidator` (yapısal il/ilçe/mahalle kontrolü, [`LocationCatalogService`](../src/main/java/com/serhat/secondhand/listing/application/common/LocationCatalogService.java) üzerinden).
3. `ListingLocationPolicy` (kategoriye göre lokasyon kuralı).
4. Kategoriye ait her `CategorySpecValidator<T>` için önce `cleanup(listing)` (hepsi), sonra `validate(listing)` (hepsi).
5. `ListingAttributeValidator` (`cleanup` + `validate`, `data/attributes/*.json` ile seed'lenen tanımlar).

`cleanupAndValidateCollectErrors` aynı adımları hata biriktirerek çalıştırır; hatalar `"KOD|mesaj"` string'leri olarak döner (konum hatasında kalan adımlar atlanır).

Kategori validator'ları `listing/validation/<kategori>/` altındadır ve her serviste `List<...SpecValidator>` olarak enjekte edilir:

| Kategori | Validator'lar |
| :--- | :--- |
| Vehicle | `VehicleRequiredFieldsValidator`, `VehicleHierarchyValidator`, `VehicleTypeRulesValidator` |
| Electronics | `ElectronicRequiredFieldsValidator`, `ElectronicHierarchyValidator`, `ElectronicTypeRulesValidator` |
| Clothing | `ClothingTypeRulesValidator` |
| Real estate | `RealEstateTypeRulesValidator` |
| Books | `BooksRequiredFieldsValidator`, `BooksHierarchyValidator` |
| Sports | `SportsRequiredFieldsValidator`, `SportsHierarchyValidator` |

`*TypeRulesValidator` sınıfları kuralları koddan değil, veritabanına seed'lenmiş type kurallarından (`types.json`, `realestate.json`) okur; tip adına bakan `if` zinciri yoktur.

---

## 4. Katalog JSON Verisi

Referans veri [`src/main/resources/data/`](../src/main/resources/data/) altındadır (toplam 317 JSON dosyası). Dizin `.gitignore` ile repo dışında tutulur; seed için yerel kopya gerekir ve bu dizine verilen linkler GitHub'da açılmaz. Sayılar dosyalardan doğrulanmıştır:

| Yol | İçerik |
| :--- | :--- |
| `data/vehicles/` | 109 JSON: `brands.json` (72 marka), `types.json` (4 tip: bodyTypes + alan kuralları), `cars/`, `motorcycles/`, `trucks/`, `commercial/`, `bicycles/` altında marka başına model dosyaları |
| `data/electronics/` | 191 JSON: `brands.json` (80 marka), `types.json` (19 tip + alan kuralları), tip klasörleri (`phones/`, `laptops/` …) altında marka/tip başına model dosyaları; `SOURCES.md` kaynakları listeler |
| `data/clothing/` | `types.json` (59 tip; `group`, `sizes`, `fields`), `brands.json` (100 marka) |
| `data/books/` | `books.json` (tür/dil/format vb. referans), `catalog.json` (publishers, authors, works) |
| `data/realestate/` | `realestate.json` (tipler, ilan tipleri, ısıtma, owner type), `specs.json` |
| `data/sports/sports.json` | 29 discipline, 163 equipment type, 5 condition |
| `data/common/locations.json` | 81 il, 973 ilçe, 13.526 mahalle; `sizes.json` beden sistemleri |
| `data/attributes/*.json` | Kategori bazlı dinamik attribute tanımları (5 dosya) |
| `data/listing-generator/` | Listing generator girdileri (`photos`, `prices`, `realestate-prices`) |

### Loader'lar

Her kategorinin bir `SeedTask` implementasyonu (`*DataInitializer`) vardır; seed key'leri ve çalıştırma yolu [migration/seeding kılavuzunda](database-migration-and-seeding-guide.md#2-katalog-ve-json-seeding-pipeline) anlatılır. `VehicleDataInitializer` ve `ElectronicDataInitializer` bilinmeyen tip/body type referansında `IllegalStateException` / `IllegalArgumentException` ile seed'i durdurur.

### Lokasyon cache'i

`LocationCatalogService` `data/common/locations.json` dosyasını Redis'e üç anahtar olarak yazar: `v6:catalog:locations:cities` (value), `...:districts` ve `...:neighborhoods` (hash). Katalog Redis'te varsa startup'ta JSON tekrar parse edilmez; yoksa `reloadCatalog()` (synchronized) yeniden yükler. Redis okuma hatasında JSON'dan fallback okunur. Mahallesi olmayan ilçe için `<İLÇE>_MERKEZ` mahallesi döner. Yapıyı değiştirirseniz anahtar sürümünü (`v6`) artırın.

### Enum / katalog okuma

[`EnumReadService`](../src/main/java/com/serhat/secondhand/core/application/EnumReadService.java) repository'lerden katalog listelerini toplar ve `name`'e göre tekilleştirir. Cache'leme servis içinde değil repository seviyesindedir (örn. `CarBrandRepository.findAll` → `@Cacheable("catalog:brands")`); `CacheConfig` bu `catalog:*` cache'lerini ayrı `lookupConfig` ile tanımlar, key prefix'i `v4:<cacheName>:`'dir. Seed tamamlandığında `CatalogSeedStartupRunner` tüm `catalog:` cache'lerini temizler.

---

## 5. Yeni Kategori / Katalog Değeri Ekleme

- **Mevcut kategoriye marka/model/tip:** ilgili JSON'u düzenleyin ve `--app.seed=<key>` ile seed'i çalıştırın (upsert; JSON'da kalmayan kayıtlar, referans edilmiyorsa prune edilir).
- **Yeni kategori:** `Listing` alt sınıfı + Flyway migration (tablo), `*ListingService extends AbstractListingService`, `CategorySpecValidator` implementasyonları, `SeedTask` ve JSON verisi gerekir. API sözleşmesi ve katman kuralları için `polymorphic-catalog-and-layered-api` skill'ine bakın.

---

## 6. Kategoriye Özel Katalog Kuralları

Her vertical'ın katalog hiyerarşisi, snapshot kuralları ve seed doğrulamaları [listing/README.md](../src/main/java/com/serhat/secondhand/listing/README.md) içinde tutulur; burada tekrar edilmez:

| Konu | Bölüm |
| :--- | :--- |
| Araç: type → brand → model → generation → version (`vehicle_versions`), `VehicleSpecSnapshotter` | Vehicle Catalog |
| Elektronik: model `specs`/`colors`, model varyantları (`electronic_model_variants`), `ElectronicSpecSnapshotter` | Electronics Catalog |
| Emlak: rule-driven property type'lar, ilan detayında yaklaşık konum haritası | Real Estate Catalog |
| Kitap: work/edition kataloğu, ISBN-13 doğrulaması (`BOOK_ISBN_INVALID`), `BooksEditionSnapshotter` | Book Catalog |
| Giyim: type kuralları ve beden sistemleri | Clothing Catalog |
| Listing generator (`listings-generate` / `listings-clean`, yalnızca local) | Listing Generator |
