# Backend Veri ve Katalog Denetim Raporu

## 1. Kritik Bulgular (Veri – Kod Uyumsuzlukları ve Veri Kaybı Hataları)

Veri dosyalarını büyütmeden önce, mevcut verinin sistemde doğru çalışmasını engelleyen şu 7 doğrulanmış hatayı çözmemiz gerekiyor:

### [ÇÖZÜLDÜ] 1. EnumReadService.deduplicateByName() Verilerin %56–%81'ini Siliyor (Kritik)
- `EnumReadService.deduplicateByName` metodu kayıtları yalnızca `name` alanına göre tekilleştirdiği için hiyerarşik üst ebeveyn ID'lerini yutuyordu.
- `deduplicateBy(items, keyExtractor)` mekanizması geliştirilerek üst ebeveyn ID'leri (`brandId:typeId:name`, `modelId:name`, `generationId:name:fuelType`, `generationId:name`, `bookTypeId:name`) gözetildi. 7 birim testi (`EnumReadServiceTest`) yazılarak tüm verilerin korunduğu ve düz alanlarda yerelleştirilmiş etiket önceliğinin sürdürüldüğü doğrulandı.


### [ÇÖZÜLDÜ] 2. Sports: 29 Branşın 11'inde İlan Oluşturulamıyor
- `sports.json` dosyasına eksik olan 11 branş (`RUNNING`, `WALKING`, `CYCLING`, `SWIMMING`, `BOXING`, `MARTIAL_ARTS`, `TREKKING`, `BADMINTON`, `GOLF`, `CLIMBING`, `SURFING`) için 60 adet zengin ekipman tipi eklendi.
- Frontend `sportsConfig.js` içinde `getOptions` metodlarına `OTHER_EQUIPMENT` emniyet fallback'i eklenerek boş liste ve form donması engellendi.
- `SportsDataInitializerTest` ile 29 branşın tamamının eşleşen ekipman türüne sahip olduğu ve `SportsRequiredFieldsValidator` akışı doğrulandı.


### [ÇÖZÜLDÜ] 3. Clothing: types.json ile Validator'lar Arasında 23 Tip Uyumsuz
- `ClothingGroup` (`APPAREL`, `FOOTWEAR`, `ACCESSORY`) merkezi enum mimarisi oluşturuldu; `ApparelValidator`, `FootwearValidator` ve `AccessoryValidator` bu enum üzerinden ortak kural setiyle bağlandı.
- `clothing/types.json` dosyasına `"group"` alanı ve 8 standart tip (`BLOUSE`, `TUNIC`, `JUMPSUIT`, `OVERCOAT`, `RAINCOAT`, `LOAFERS`, `CLUTCH`, `SUITCASE`) eklenerek toplam 61 tip eksiksiz olarak gruplandırıldı.
- `EnumReadService.getClothingTypes()` çıktısına `group` bilgisi eklendi; frontend `clothingConfig.js` dinamik `getClothingGroup` mekanizmasına geçirilerek `SLIPPERS`, `WATCH`, `WALLET`, `SUNGLASSES`, `RING` gibi tiplerde yaşanan beden/ayakkabı numarası form anomalileri giderildi.
- 33 test senaryosu (`ClothingValidationTest`) ile doğrulandı.


### [ÇÖZÜLDÜ] 4. Real Estate: realestate.json & specs.json ile Validator Çatışmaları
- `RealEstateCategory` (`RESIDENTIAL`, `LAND`, `COMMERCIAL`, `OTHER`) enum mimarisi oluşturuldu; `COMMERCIAL_LAND` ("Ticari / Sanayi İmarlı Arsa") arsa grubuna dahil edilerek `HouseValidator`, `LandValidator` ve `RealEstateSubtypeFieldPolicy` arasındaki sınıflandırma çatışması giderildi. `COMMERCIAL_LAND` için oda sayısı ve ısıtma tipi zorunluluğu kaldırıldı, `zoningStatus` temizlenmesi önlendi.
- `specs.json` içindeki `roomConfigs` 18 seçeneğe (1.5+1, 2+0, 2+2, 3+0, 3+2, 4+0, 5+1, 5+2, 6+1, 6+2, 7+1, 8+ vb.) ve `zoningStatuses` 11 seçeneğe (`INDUSTRIAL_ZONED`, `TOURISM_ZONED`, `MIXED_ZONED`, `OLIVE_GROVE`, `PROTECTED_AREA`, `PUBLIC_ZONED` vb.) genişletildi.
- `RealEstateSpecCatalogService` `RealEstateSubtypeFieldPolicy` içine entegre edilerek `roomConfigKey` ve `zoningStatusKey` değerlerinin katalog doğrulaması sağlandı; ayrıca formdan gelen legacy/temel alanlar (`roomCount`, `zoningStatus`) ile katalog key'leri arasında çift yönlü otomatik senkronizasyon ve esnek doğrulama eklendi.
- `realestate.json` içindeki 14 mülk tipine `"category"` alanı eklendi ve `EnumReadService.getRealEstateTypes()` üzerinden frontend'e sunuldu. `realEstateConfig.js` ve `realEstates.js` içinde `isLandType` kontrolü `COMMERCIAL_LAND` ve tüm arsa tiplerini kapsayacak şekilde güncellendi.
- 18 birim testinden oluşan `RealEstateValidationTest` ve `EnumReadServiceTest` entegrasyonu ile doğrulandı.

### [ÇÖZÜLDÜ] 5. Vehicles: Validator, Seed ve UI Arasındaki Tip Kopukluğu
- `VehicleDataInitializer` içine `formatTypeLabel(key)` eklenerek araç tipi etiketleri Türkçe ve okunabilir standart isimlere (`CAR` -> "Otomobil", `COMMERCIAL` -> "Ticari Araçlar", `MOTORCYCLE` -> "Motosiklet", `TRUCK` -> "Kamyon / Çekici", `VAN` -> "Minibüs / Panelvan", `BICYCLE` -> "Bisiklet") dönüştürüldü; `pruneStaleTypes` metodu çekirdek araç tiplerini koruyacak şekilde güncellendi.
- `CommercialVehicleValidator` bileşeni yazılarak `COMMERCIAL` tipindeki araçların kilometre, yakıt türü, vites ve kasa tipi kuralları eksiksiz doğrulandı.
- `MotorcycleValidator.cleanup()` metodunun `bodyType` ve `horsePower` alanlarını silmesi engellendi; motosikletler için kasa tipi (Sportbike, Naked, Scooter vb.) ve beygir gücü verileri korundu.
- Frontend `vehicleCatalogUtils.js` ve `vehicleConfig.js` içinde `isCarVehicle` kısıtları kaldırılarak `isCommercialVehicle`, `isMotorcycleVehicle` ve `hasBodyType` destekleri eklendi; hem motosiklet hem de ticari araçlar için kasa, nesil, motor ve paket seçimlerinin formda ve filtrelerde dinamik olarak görüntülenmesi sağlandı.
- 7 birim testi (`VehicleValidationTest`) ile doğrulandı.

### [ÇÖZÜLDÜ] 6. Electronics: JSON'daki Zengin Metadata'nın Yutulması ve Etiket Eksikliği
- `ElectronicDataInitializer.formatTypeLabel()` içine `WASHING_MACHINE` eklenerek "Çamaşır Makinesi" standart Türkçe etiketi sağlandı.
- `V21__add_electronic_model_metadata.sql` migrasyonu ile `electronic_models` tablosuna `release_year`, `is_legacy` ve `aliases` kolonları eklendi.
- `ElectronicModel` varlığına `releaseYear`, `isLegacy` ve `aliases` (`StringListJsonConverter` ile JSON formatında) alanları tanımlandı.
- `ElectronicDataInitializer.ensureModel()` metodu `modelDto` üzerinden gelen `releaseYear`, `isLegacy` ve `aliases` verilerini hem yeni modellerde kaydedecek hem de mevcut modellerde güncelleyecek (upsert) şekilde refaktör edildi.
- `EnumReadService.getElectronicModels()` çıktısına `releaseYear`, `isLegacy` ve `aliases` alanları eklendi; frontend `electronicsConfig.js` içinde model seçildiğinde `year` alanının modelin `releaseYear` bilgisiyle otomatik doldurulması ve `SearchableDropdown` ile `ListingPrefilterSelectionFlow` bileşenlerinde model aramalarında `aliases` (kısaltmalar/eşanlamlılar: örn. "PS5", "15 Pro") desteği sağlandı.
- 4 birim testi (`ElectronicDataInitializerTest`) ve `EnumReadServiceTest` entegrasyonu ile doğrulandı.

### [ÇÖZÜLDÜ] 7. Locations (locations.json): Mahalle Verisinin %94.6 Oranında Boş Olması
- Türkiye'nin 81 iline ait tüm 973 resmi ilçesi `locations.json` içine eksiksiz olarak tanımlandı (eksik 121 ilçe tamamlandı; İstanbul 37'den 39'a [Arnavutköy, Sultanbeyli eklendi], İzmir 28'den 30'a, Konya 11'den 31'e, Trabzon 8'den 18'e çıkarıldı).
- Mahalle verisi 188'den 3.479'a çıkarıldı; İstanbul, Ankara, İzmir, Bursa, Antalya gibi büyükşehirlerin tüm ilçelerine gerçek ve yaygın mahalleler eklendi; Türkiye'deki 973 ilçenin hiçbirinde boş (`[]`) mahalle bırakılmadı (0 mahalleli ilçe sayısı: 0).
- `LocationCatalogService` Redis cache anahtarları `v5` sürümüne yükseltilerek eski boş verinin önbellekten temizlenmesi sağlandı; ayrıca olası eksik sorgularda form ve validatörün donmasını önlemek için dinamik `Merkez` mahalle fallback emniyeti eklendi.
- `LocationValidator` hiyerarşik doğrulama mantığı güçlendirildi.
- 10 birim testi (`LocationCatalogServiceTest` ve `LocationValidatorTest`) ile 81 il, 973 ilçe, zengin mahalleler ve validatör kuralları doğrulandı.

---

## 2. Kategori Bazlı Veri Geliştirme ve Güçlendirme Önerileri

### [ÇÖZÜLDÜ] 2.A Electronics (`src/main/resources/data/electronics/`)

#### Eksik Kritik Markaların ve Modellerin Eklenmesi:
- **GAME_CONSOLE:** Microsoft (Xbox Series X, Series S, One X/S), Nintendo (Switch OLED, Switch, Switch Lite, Switch 2), Valve (Steam Deck OLED/LCD), Lenovo (Legion Go), MSI (Claw) eklendi.
- **CAMERA:** Canon (EOS R5/R6/R7/R8/R10/R50, 5D/6D/90D), Nikon (Z8, Z9, Z6 III, Zf, Z50), Fujifilm (X100VI, X100V, X-T5, X-S20), GoPro (Hero 13/12/11/10), DJI (Osmo Pocket 3, Action 5 Pro/4, Mavic 3, Air 3, Mini 4 Pro), Insta360 (X4, X3, Ace Pro) eklendi.
- **KEYBOARD & MOUSE:** Logitech (MX Master 3S, G Pro X Superlight 2, MX Keys S), Razer, SteelSeries, Keychron, Corsair, HyperX, ASUS ROG eklendi.
- **ROBOT_VACUUM:** Roborock (S8 MaxV Ultra, S8 Pro Ultra, Q Revo, Q8 Max), Dreame (X40 Ultra, L20 Ultra, L10s Ultra), Dyson, iRobot (Roomba), Ecovacs, Philips, Viomi eklendi.
- **HEADPHONES & SPEAKER:** JBL, Marshall, Bose, Sennheiser, Beats, Anker Soundcore, Harman Kardon, Bang & Olufsen, HyperX, Razer, SteelSeries, Logitech, Jabra eklendi.
- **LAPTOP, DESKTOP, MONITOR:** MSI, Acer, Monster (Abra, Tulpar, Semruk), Casper / Excalibur, Gigabyte, Razer, Microsoft (Surface), BenQ, AOC, ViewSonic eklendi.
- **MOBILE_PHONE & SMARTWATCH:** Honor, Oppo, Realme, Vivo, Nothing, Tecno, Infinix, General Mobile; akıllı saatlerde Garmin (Fenix, Forerunner, Venu), Amazfit, Honor, Suunto eklendi.
- **ROUTER & PRINTER & Ev Elektroniği:** Router için TP-Link, Keenetic, Xiaomi, Zyxel; Yazıcı için Canon, Epson, Brother; Beyaz eşya/klima için Bosch, Siemens, Profilo, Mitsubishi Electric, Gree, Baymak ve Vestel/Arçelik/Beko için TV & klima çapraz tipleri eklendi.
- Toplam 114 yeni JSON veri dosyası oluşturuldu; `brands.json` 19 markadan 80 markaya ve 189 tip dosyasına genişletilerek tam kapsayıcılık sağlandı.

#### İsimlendirme Standartlaştırması:
- 826 modelde model adı başındaki marka tekrarları temizlendi ("Sony WH-1000XM5" -> "WH-1000XM5"), orijinal isimler ve arama varyasyonları `aliases` dizisine taşındı. UI'da "Sony Sony WH-1000XM5" tekrarları önlendi.
- `releaseYear`, `isLegacy` ve `aliases` eksik olan tüm modeller tamamlandı (0 eksik metadata).

#### OTHER (Diğer) Marka ve Model Desteği:
- 19 elektronik tipinin tamamı için genel bir `OTHER` ("Diğer / Other") markası ve her tipe ait "Diğer Model" JSON dosyaları oluşturuldu.

#### Metadata Kullanımı:
- `ElectronicModel` tablosu `V21__add_electronic_model_metadata.sql` ve `StringListJsonConverter` ile `release_year`, `is_legacy` ve `aliases` kolonlarıyla güçlendirildi.
- `ElectronicDataInitializer` bu metadataları upsert edecek şekilde güncellendi.
- Frontend tarafında `SearchableDropdown.jsx`, `ListingPrefilterSelectionFlow.jsx` ve `electronicsConfig.js` ile alias araması ve model seçildiğinde `year` alanının otomatik doldurulması sağlandı.
- `ElectronicDataInitializerTest` ile 189 dosya ve 80 marka için tüm dosyaların varlığı ve veri doğruluğu test edilerek doğrulandı.

---

### [ÇÖZÜLDÜ] 2.B Vehicles (`src/main/resources/data/vehicles/`)

#### Türkiye Pazarındaki Eksik Otomobil, Motosiklet ve Ticari Markalar:
- **CAR:** TOGG (T10X, T10F), Tesla (Model Y, Model 3, Model S, Model X), Chery (Tiggo 8 Pro, Tiggo 7 Pro, Omoda 5), BYD (Atto 3, Seal U DM-i/EV, Dolphin, Han), MG (ZS, HS, MG4), Cupra (Formentor, Leon, Terramar, Born, Ateca), Mini (Cooper, Countryman, Clubman), DS Automobiles (DS 4, DS 7, DS 9), SsangYong / KGM (Torres, Musso Grand, Korando), Jaguar (F-Pace, E-Pace, I-Pace, XF), Maserati (Ghibli, Levante, Grecale) eklendi.
- **MOTORCYCLE:** Vespa, Piaggio, Aprilia, Harley-Davidson, Husqvarna, CFMoto (250 NK, 250 SR, 450 SR, 450 MT, 700 CL-X, 800 MT), Bajaj (Pulsar NS200, RS200, Dominar 400, Dominar 250, Pulsar NS125), SYM, Kymco, Benelli, Royal Enfield, Mondial, Arora, RKS, Kuba eklendi.
- **COMMERCIAL:** Peugeot (Rifter, Partner, Boxer, Expert), Citroën (Berlingo, Jumper, Jumpy), Opel (Combo, Vivaro, Movano), Toyota (Hilux, Proace City), Isuzu (D-Max, NPR), Iveco (Daily), Mitsubishi (L200) eklendi.
- **BICYCLE:** Trek, Specialized, Giant, Scott, Bianchi, Carraro, Salcano, Kron, Mosso, Bisan markaları ve popüler modelleri `bicycles/` dizininde kataloglandı; `brands.json`'a `BICYCLE` destekli tipler olarak eklendi.

#### Motor Verisinin Zenginleştirilmesi (horsePower, engineCapacity, LPG):
- `V22__add_vehicle_generation_and_engine_specs.sql` migration'ı oluşturuldu; `vehicle_generations` (`start_year`, `end_year`) ve `vehicle_engines` (`horse_power`, `engine_capacity`) kolonları eklendi.
- `VehicleGeneration` ve `VehicleEngine` entity'leri, DTO'ları ve `EnumReadService` API yanıtları bu alanlarla genişletildi.
- `VehicleDataInitializer`, JSON'dan gelen veya isim/kasa kalıplarından regex ile çıkarılan `startYear`, `endYear`, `horsePower` ve `engineCapacity` bilgilerini otomatik parse edip upsert edecek şekilde güçlendirildi.
- `BMW` / `BMW_MOTORRAD` ve `SUZUKI` / `SUZUKI_MOTO` markaları tek bir marka altında çoklu `supportedTypes` (`CAR`, `MOTORCYCLE`) yapısında birleştirildi.
- Frontend'de `vehicleCatalogUtils.js` ve `vehicleConfig.js` güncellenerek motor seçildiğinde `fuelType`, `horsePower` ve `engineCapacity` otomatik dolduruldu; kasa/jenerasyon seçildiğinde `year` varsayılan olarak jenerasyonun başlangıç yılına bağlandı.
- `VehicleValidationTest` içine eklenen testlerle tüm 73 marka ve 86 katalog dosyasının tamlığı, jenerasyon/motor regex ayrıştırması ve validatör kuralları doğrulandı (10/10 test başarılı).

---

### [ÇÖZÜLDÜ] 2.C Clothing (`src/main/resources/data/clothing/`)

#### Tip Katalog Yapısının (types.json) Grup Bilgisiyle Zenginleştirilmesi:
- `ClothingGroup` enum'ı (`APPAREL`, `FOOTWEAR`, `ACCESSORY`) tanımlandı; `clothing/types.json` içindeki tüm tiplere `"group"` alanı eklendi.
- Eksik giyim/aksesuar tipleri eklendi: `BLOUSE` (Bluz), `TUNIC` (Tunik), `JUMPSUIT` (Tulum), `OVERCOAT` (Kaban/Palto), `RAINCOAT` (Yağmurluk), `LOAFERS` (Loafer/Makosen), `CLUTCH` (Portföy Çanta), `SUITCASE` (Valiz/Bavul).
- `ApparelValidator`, `FootwearValidator`, `AccessoryValidator` ve frontend `clothingConfig.js` dinamik grup kontrolüne geçirilerek 60+ tip için eksiksiz doğrulama sağlandı.

#### Marka Kataloğunun (brands.json) Düzeltilmesi ve Genişletilmesi:
- `"IPEYKOL"` yazım hatası `"IPEKYOL"` (İpekyol) olarak düzeltildi.
- Decathlon'un bisiklet/balıkçılık alt markaları (`BTWIN`, `ROCKRIDER`, `TRIBAN`, `CAPERLAN`, `SIMOND`, `OXELO`) giyim kataloğundan temizlenerek bisiklet/spor alanlarına aktarıldı.
- Türkiye'de popüler giyim, ayakkabı ve aksesuar markaları (Oysho, U.S. Polo Assn., Pierre Cardin, Kiğılı, Altınyıldız Classics, Sarar, Damat Tween, Avva, Lufian, Tudors, Penti, Suwen, Crocs, Birkenstock, Dr. Martens, Camper, Reebok, Fila, Champion, Gant, Nautica, Michael Kors, Coach, Ray-Ban, Casio, Seiko, Pandora, Swarovski) eklendi ve toplam marka sayısı 100'e çıkarıldı.
- `ClothingBrand` ve `ClothingType` sınıfları `Persistable<UUID>` uygulayarak deterministik UUID (`UUID.nameUUIDFromBytes`) yapısına geçirildi; `ClothingDataInitializer` label güncellemelerini algılayıp DB'yi upsert edecek şekilde güncellendi.
- `ClothingValidationTest` (35 birim testi) ile tüm grup kuralları, temizlenen markalar ve yeni markalar başarıyla doğrulandı.

---

### [ÇÖZÜLDÜ] 2.D Real Estate (`src/main/resources/data/realestate/`)

#### specs.json Genişletmesi ve Entegrasyonu:
- `specs.json` içindeki `roomConfigs` 6 seçenekten 18 seçeneğe genişletildi: 1+0, 1+1, 1.5+1, 2+0, 2+1, 2+2, 3+0, 3+1, 3+2, 4+0, 4+1, 4+2, 5+1, 5+2, 6+1, 6+2, 7+1, 8+ ve Üzeri.
- `zoningStatuses` içine `INDUSTRIAL_ZONED` (Sanayi İmarlı), `TOURISM_ZONED` (Turizm İmarlı), `MIXED_ZONED` (Ticari + Konut), `OLIVE_GROVE` (Zeytinlik), `PROTECTED_AREA` (Sit Alanı), `PUBLIC_ZONED` (Kamu / Özel Kullanım), `VINEYARD_GARDEN` (Bağ/Bahçe) eklendi ve toplam 11 imar durumu sağlandı.
- `RealEstateCategory` enum'ı (`RESIDENTIAL`, `LAND`, `COMMERCIAL`, `OTHER`) oluşturuldu; `realestate.json` içindeki her `propertyTypes` öğesine `"category"` eklendi.
- `RealEstateSpecCatalogService`, `HouseValidator`, `LandValidator`, `RealEstateSubtypeFieldPolicy` ve frontend `realEstateConfig.js` / `realEstates.js` dinamik kategori bazlı kontrole taşınarak alt-tip uyuşmazlıkları tamamen giderildi.
- `RealEstateValidationTest` (18 birim testi) ile konut, arsa, ticari ve kategori eşleme kuralları doğrulandı.

---

### [ÇÖZÜLDÜ] 2.E Books (`src/main/resources/data/books/books.json/`)

#### Açık key Tanımları ve Deterministik UUID:
- `books.json` içindeki `types`, `genres`, `languages`, `formats`, `conditions` yapısı tamamen `{ "key": "...", "label": "..." }` nesnelerine geçirildi; parantez veya eğik çizgi içeren (`CILTLI_(HARDCOVER)`, `SIFIR_/_AMBALAJINDA`) key'ler temizlendi (`HARDCOVER`, `PAPERBACK`, `NEW`, `LIKE_NEW` vb.).
- `BookType`, `BookGenre`, `BookLanguage`, `BookFormat`, `BookCondition` sınıfları `Persistable<UUID>` uygulayarak `UUID.nameUUIDFromBytes` ile deterministik UUID yapısına geçirildi.
- `BooksDataInitializer`, hem eski düz metin dizilerini hem de yeni nesne yapısını destekleyecek şekilde güncellendi; etiket ve kitap türü hiyerarşisi değişikliklerini algılayıp DB'yi upsert edecek hale getirildi.
- `V23__add_book_and_sport_catalog_spec_columns.sql` migration'ı oluşturuldu (`label` ve `book_type_id` kolonları ile foreign key indeksleri eklendi).

#### Eksik Kitap Türleri ve Alt Türler:
- Genel kültür ve kurgu dışı 6 yeni kitap türü eklendi: `TARIH_VE_ARASTIRMA` (Tarih, Araştırma & İnceleme), `FELSEFE_VE_SOSYOLOJI` (Felsefe, Sosyoloji & Antropoloji), `SANAT_VE_TASARIM` (Sanat, Mimarlık, Fotoğraf & Müzik), `HOBI_VE_YASAM` (Yemek, Gastronomi, Sağlık, Ebeveynlik & Yaşam), `DERGI_VE_SURELI_YAYIN` (Dergi, Çizgi Roman, Manga & Koleksiyon), `OTHER` (Diğer Kitaplar).
- 16 kitap türünün her biri altına zengin alt türler ve tür bazlı `OTHER` ("Diğer ...") alt türü eklendi; genel geri dönüş için de global `OTHER` türü korundu.
- `BooksValidationTest` (5 birim testi) ve `EnumReadServiceTest` (8 birim testi) ile katalog tamlığı, deterministik ID'ler, zorunlu alanlar ve hiyerarşi kuralları doğrulandı.

---

### [ÇÖZÜLDÜ] 2.F Sports (`src/main/resources/data/sports/sports.json/`)

#### Eksik 11 Branşın Ekipmanlarının Tamamlanması ve Hiyerarşi:
- Eksik olan 11 branş (`RUNNING`, `WALKING`, `CYCLING`, `SWIMMING`, `BOXING`, `MARTIAL_ARTS`, `TREKKING`, `BADMINTON`, `GOLF`, `CLIMBING`, `SURFING`) dahil olmak üzere 29 spor disiplininin tamamı için 100+ zengin ekipman tipi eklendi.
- Mevcut ekipman etiketlerindeki aşırı spesifik ürün ifadeleri ("65L Outdoor Backpack", "Balls (3-Pack)", "Hex Dumbbell Set" vb.) temizlendi ve genel kategori etiketlerine ("Kamp & Outdoor Sırt Çantası", "Tenis Topu", "Dambıl & El Ağırlığı" vb.) dönüştürüldü; tüm disiplinler, ekipmanlar ve durumlar standart Türkçe etiketlere kavuşturuldu.
- `SportEquipmentType` entity'sine `@ManyToOne SportDiscipline discipline` ilişkisi eklendi; `V23` migration'ı ile DB'de `discipline_id` kolonu ve FK indeksi oluşturuldu; `EnumReadService.getSportEquipmentTypes()` metoduna `disciplineId` alanı dahil edildi.
- `SportsHierarchyValidator` sınıfı yazılarak `SportsSpecValidator` zincirine eklendi; seçilen disiplin ile ekipman tipi arasındaki hiyerarşik uyum (ve `OTHER_EQUIPMENT` genel geri dönüşü) doğrulandı.
- `SportDiscipline`, `SportEquipmentType` ve `SportCondition` sınıfları `Persistable<UUID>` uygulayarak `UUID.nameUUIDFromBytes` ile deterministik UUID yapısına geçirildi; `SportsDataInitializer` etiket ve disiplin ilişkisi güncellemelerini algılayıp DB'yi upsert edecek şekilde güçlendirildi.
- `SportsValidationTest` (6 birim testi) ile 29 disiplinin eksiksizliği, aşırı spesifik ifadelerin temizliği, hiyerarşi kuralları ve deterministik UUID yapısı doğrulandı.

---

### [ÇÖZÜLDÜ] 2.G Cross-Cutting (Tüm data/ Klasörü İçin Ortak İyileştirmeler)

- **Dil Tutarlılığı (Türkçe Standardı):**
  - `realestate`: Konut, ticari ve arsa tipleri, 18 oda sayısı ve 11 imar durumu tamamen standart Türkçe.
  - `books`: 16 kitap türü, tüm alt türler, diller, cilt ve kondisyon formatları tamamen standart Türkçe.
  - `electronics`: 19 elektronik tipi (`formatTypeLabel`) ile `WASHING_MACHINE` ("Çamaşır Makinesi") dahil Türkçe etiket standardına hizalandı.
  - `clothing`: `types.json` içindeki tüm 62 giyim, ayakkabı ve aksesuar tipi ("Gömlek", "Kazak", "Kot Pantolon", "Spor Ayakkabı", "Çanta" vb.) Türkçe etiketlere geçirildi.
  - `sports`: 29 spor disiplini, 100+ ekipman tipi ve tüm kondisyonlar standart Türkçe etiketlere geçirildi; aşırı spesifik ibareler temizlendi.
  - `vehicles`: Çekirdek araç tipleri (`CAR` -> "Otomobil", `COMMERCIAL` -> "Ticari Araçlar", `MOTORCYCLE` -> "Motosiklet", `BICYCLE` -> "Bisiklet" vb.) `formatTypeLabel` ile standart Türkçe etiketlere hizalandı.

- **Deterministik UUID ve Etiket Güncelleme (Upsert):**
  - `VehicleDataInitializer`, `ElectronicDataInitializer`, `RealEstateDataInitializer`, `ClothingDataInitializer`, `BooksDataInitializer` ve `SportsDataInitializer` sınıflarının tamamı `UUID.nameUUIDFromBytes` ile deterministik UUID üretir hale getirildi.
  - İlgili tüm enum/referans entity'leri (`CarBrand`, `VehicleType`, `VehicleModel`, `VehicleGeneration`, `VehicleEngine`, `ElectronicBrand`, `ElectronicType`, `ElectronicModel`, `ClothingBrand`, `ClothingType`, `BookType`, `BookGenre`, `BookLanguage`, `BookFormat`, `BookCondition`, `SportDiscipline`, `SportEquipmentType`, `SportCondition`, `RealEstateType`, `RealEstateAdType`, `HeatingType`) `Persistable<UUID>` arayüzünü uyguladı.
  - Başlangıç seed görevleri JSON dosyalarındaki etiket (`label`) ve hiyerarşik ilişki (`bookType`, `discipline`, `model`, `generation`) değişikliklerini algılayıp DB'yi mükerrer kayıt oluşturmadan güncelleyecek (upsert) hale getirildi.
  - 6 kategori test paketi (`RealEstateValidationTest`, `VehicleValidationTest`, `ClothingValidationTest`, `BooksValidationTest`, `SportsValidationTest`, `ElectronicDataInitializerTest`) toplam 79 test ile 0 hata/atlama olmaksızın başarıyla doğrulandı.
