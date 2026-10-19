# Veritabanı Migrasyon ve Tohumlama (Seeding) Kılavuzu

Bu doküman, **secondHand** platformunun PostgreSQL veritabanı şema versiyonlama kurallarını (**Flyway**), migrasyon yazma standartlarını ve JSON katalog tohumlama (**Seeding Pipeline**) mimarisini açıklamaktadır.

---

## 1. Flyway Şema Versiyonlama Kuralları

Veritabanı değişiklikleri yalnızca [`src/main/resources/db/migration/`](../src/main/resources/db/migration/) altındaki SQL dosyaları ile yapılır.

### Katı Kurallar:
1. **Asla Mevcut Migrasyonu Düzenleme:** Yayınlanmış veya merge edilmiş hiçbir `V<N>__*.sql` dosyası değiştirilemez veya silinemez. Değişiklik ihtiyacı olduğunda her zaman yeni bir `V<N+1>__aciklama.sql` dosyası oluşturulur.
2. **İsimlendirme Formatı:** `V{Sürüm}__{açıklama_yılan_yazımı}.sql` (örneğin: `V24__add_user_reputation_score.sql`). İki adet alt çizgi (`__`) zorunludur.
3. **Idempotent ve Geriye Dönük Uyumluluk:**
   - Tablo oluştururken: `CREATE TABLE IF NOT EXISTS ...`
   - Kolon eklerken: `ADD COLUMN IF NOT EXISTS ...`
   - İndeks oluştururken: `CREATE INDEX IF NOT EXISTS ...`
4. **Veri Tipleri Standartları:**
   - Birincil anahtarlar: `UUID` veya `BIGINT GENERATED ALWAYS AS IDENTITY`.
   - Para miktarları: Kesinlikle `DECIMAL(19, 4)` veya `NUMERIC(15, 2)`. Float/Double yasaktır.
   - Zaman damgaları: `TIMESTAMP WITH TIME ZONE` veya `TIMESTAMP`.

---

## 2. Katalog ve JSON Tohumlama (Seeding Pipeline)

Platformun zengin marka, model, il/ilçe ve teknik özellikleri SQL içine satır satır yazılmaz; [`src/main/resources/data/`](../src/main/resources/data/) altındaki JSON dosyalarından beslenir.

### Veri Dizin Haritası:
- `data/electronics/`: 80 marka, 189 tip dosyası, model alias'ları (örn. "PS5", "15 Pro"), çıkış yılları (`releaseYear`).
- `data/vehicles/`: 73 marka, 86 katalog dosyası, jenerasyon başlangıç/bitiş yılları, motor hacmi ve beygir gücü regex ayrıştırması.
- `data/clothing/`: APPAREL, FOOTWEAR ve ACCESSORY gruplamaları (`types.json`).
- `data/locations.json`: 81 il, 973 ilçe, 3.479 mahalle verisi.
- `data/sports.json`: 29 branş ve 60 ekipman türü.

### Tohumlama Yaşam Döngüsü:
1. **Başlangıç Çalıştırıcıları (`DataInitializer`):**
   - Uygulama ayağa kalkarken `ElectronicDataInitializer`, `VehicleDataInitializer`, `SportsDataInitializer` sınıfları JSON verilerini tarar.
2. **Upsert Mantığı:**
   - Mevcut modeller silinmez; yeni modeller veritabanına eklenir (`ensureModel`), eksik metadata kolonları (`release_year`, `horse_power`) güncellenir.
3. **Önbellek Geçersiz Kılma:**
   - Katalog güncellendiğinde `EnumReadService` ve `LocationCatalogService` önbellek sürümleri (`v5`) üzerinden güncel veriyi RAM'e alır.

---

## 3. Yeni Migrasyon Ekleme Adımları (Checklist)

1. Son sürüm numarasını kontrol edin (`ls src/main/resources/db/migration/`).
2. Yeni sürüm dosyasını oluşturun (`V<N+1>__aciklama.sql`).
3. DDL scriptini yazın ve indeks gereksinimlerini belirleyin (özellikle sorgu filtreleri ve yabancı anahtarlar için indeks ekleyin).
4. İlgili JPA entity sınıfına yeni alanları ekleyin.
5. Uygulamayı yerel profilde başlatıp Flyway loglarını doğrulayın:
   ```bash
   ./mvnw spring-boot:run
   ```
