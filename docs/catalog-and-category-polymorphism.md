# Kategori Polimorfizmi, Dinamik Katalog ve Doğrulama Zinciri Mimarisi

Bu doküman, **secondHand** platformunun 6 temel dikeydeki (Emlak, Vasıta, Elektronik, Giyim, Kitap, Spor) **Polimorfik İlan Veri Modelini**, **189 JSON dosyasından oluşan Dinamik Tohumlama (Seeding) Mimarisini**, **Template Method Tabanlı Servis Katmanını (`AbstractListingService`)**, **Sorumluluk Zinciri Tabanlı Validatör Motorunu (`ListingValidationEngine`)** ve **Yerelleştirilmiş Hiyerarşik Önbellekleme Altyapısını (`EnumReadService`, `LocationCatalogService`)** detaylandırmaktadır.

---

## 1. Mimari Genel Bakış

İkinci el platformlarında farklı kategorilerin gereksinimleri radikal biçimde farklılaşır:
- Bir otomobil için jenerasyon, yakıt tipi, vites, kasa tipi, beygir gücü ve motor hacmi gerekir.
- Bir emlak için oda sayısı, ısıtma tipi, bina yaşı, kat ve imar durumu zorunludur.
- Bir giyim ürünü için beden/numara, cinsiyet ve giyim grubu (`APPAREL`, `FOOTWEAR`, `ACCESSORY`) ayrımı şarttır.

Bu karmaşıklığı monolitik tek bir tabloda `JSONB` kargaşasına dönüştürmek yerine, **JPA Polimorfizmi (`JOINED` Inheritance)** ve **Tasarım Kalıpları** ile tip güvenli bir mimari kurulmuştur.

```
                           [ Listing (Çekirdek Varlık) ]
        (id, title, description, price, status, seller, address, images)
                                       │
     ┌──────────────┬──────────────┬───┴──────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼              ▼              ▼
[VehicleListing] [RealEstate] [ElectronicListing] [Clothing]   [BookListing]  [SportsListing]
 (generation,    (roomConfig,   (model, specs,    (size, group,  (author,       (sportBranch,
  engine, km)     zoningStatus)  releaseYear)      gender)        isbn, genre)   equipmentType)
```

---

## 2. Tasarım Kalıpları ve Uygulama Mimarisi

### A. Template Method Deseni: [`AbstractListingService.java`](../src/main/java/com/serhat/secondhand/listing/application/category/AbstractListingService.java)
Tüm kategori servisleri (`VehicleListingService`, `RealEstateListingService`, vb.) `AbstractListingService` sınıfından türer.
Ortak oluşturma ve güncelleme akışı üst sınıfta sabittir:
1. `validateCommonRules()`: Satıcı yetkisi, genel başlık ve fiyat limitleri kontrol edilir.
2. `validateCategorySpecificRules()`: Her kategori alt sınıfının kendi özelleşmiş kuralları çalıştırılır.
3. `buildSpecificListing()`: İlgili kategoriye özgü JPA varlığı inşa edilir.
4. `saveAndPublishEvents()`: İlan kaydedilir, Transactional Outbox veya event yayınlanır, Redis cache anahtarları temizlenir.

---

### B. Chain of Responsibility: [`ListingValidationEngine.java`](../src/main/java/com/serhat/secondhand/listing/validation/common/ListingValidationEngine.java)
İlan kaydedilmeden önce doğrulama kuralları sıralı zincir üzerinden işletilir:
- **`ApparelValidator` / `FootwearValidator` / `AccessoryValidator`:** Giyim grubuna göre doğru beden/numara kurallarını denetler. Saat, çanta veya cüzdan tiplerine ayakkabı numarası girilmesini engeller.
- **`HouseValidator` / `LandValidator` / `CommercialLandValidator`:** Arsa ilanlarında oda sayısı ve ısıtma tipi zorunluluğunu kaldırır; konutlarda imar durumu alanını temizler.
- **`CommercialVehicleValidator` / `MotorcycleValidator`:** Motosikletlerde kasa tipi ve beygir gücü alanlarını korur; ticari araçlarda kilometre ve yakıt kurallarını uygular.

---

## 3. Dinamik Veri Seti ve Tohumlama (Seeding Pipeline)

Platformun marka, model, il/ilçe ve teknik özellikleri kodun içine gömülü değildir; [`src/main/resources/data/`](../src/main/resources/data/) altındaki JSON dosyalarından beslenir:

| Dizin | Dosya Sayısı | İçerik ve Detay |
| :--- | :---: | :--- |
| **`data/electronics/`** | 189 Dosya | 80 marka, 19 elektronik tipi, model alias'ları (örn. "PS5", "15 Pro"), çıkış yılları (`releaseYear`). |
| **`data/vehicles/`** | 86 Dosya | 73 marka, jenerasyon başlangıç/bitiş yılları, motor hacmi ve beygir gücü regex ayrıştırması. |
| **`data/clothing/`** | 61 Tip | APPAREL, FOOTWEAR ve ACCESSORY gruplamaları (`types.json`). |
| **`data/locations.json`** | 1 Dosya | 81 il, 973 resmi ilçe, 3.479 yaygın mahalle verisi. |
| **`data/sports.json`** | 1 Dosya | 29 branş ve 60 zengin ekipman türü. |

### Veri Yükleme ve Versiyonlama:
- **`ElectronicDataInitializer`:** JSON'dan okunan modelleri `V21__add_electronic_model_metadata.sql` ile eklenen kolonlara upsert eder.
- **`VehicleDataInitializer`:** Regex motoru ile model adından motor gücünü ve jenerasyon aralığını çıkarır (`V22` migrasyonu).
- **`LocationCatalogService`:** `v5` Redis önbellek sürümüyle mahalle ve ilçe ağacını RAM'de tutar; form yanıt süresini 0.2 milisaniyeye indirir.

---

## 4. İlgili Dosyalar

- Şablon Servis: [`AbstractListingService.java`](../src/main/java/com/serhat/secondhand/listing/application/category/AbstractListingService.java)
- Doğrulama Motoru: [`ListingValidationEngine.java`](../src/main/java/com/serhat/secondhand/listing/validation/common/ListingValidationEngine.java)
- Katalog Önbellek Servisi: [`EnumReadService.java`](../src/main/java/com/serhat/secondhand/listing/application/common/EnumReadService.java)
- Lokasyon Servisi: [`LocationCatalogService.java`](../src/main/java/com/serhat/secondhand/listing/application/common/LocationCatalogService.java)
- Elektronik Seeder: [`ElectronicDataInitializer.java`](../src/main/java/com/serhat/secondhand/listing/application/electronics/ElectronicDataInitializer.java)
- Vasıta Seeder: [`VehicleDataInitializer.java`](../src/main/java/com/serhat/secondhand/listing/application/vehicle/VehicleDataInitializer.java)
