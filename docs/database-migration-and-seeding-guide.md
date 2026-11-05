# Veritabanı Migrasyon ve Tohumlama (Seeding) Kılavuzu

Bu doküman, **secondHand** platformunun PostgreSQL veritabanı şema versiyonlama kurallarını (**Flyway**), migrasyon yazma standartlarını ve JSON katalog tohumlama (**Seeding Pipeline**) mimarisini açıklamaktadır.

---

## 1. Flyway Şema Versiyonlama Kuralları

Veritabanı değişiklikleri yalnızca [`src/main/resources/db/migration/`](../src/main/resources/db/migration/) altındaki SQL dosyaları ile yapılır.

### Katı Kurallar:
1. **Asla Mevcut Migrasyonu Düzenleme:** Yayınlanmış veya merge edilmiş hiçbir `V<N>__*.sql` dosyası değiştirilemez veya silinemez. Değişiklik ihtiyacı olduğunda her zaman yeni bir `V<N+1>__aciklama.sql` dosyası oluşturulur.
2. **İsimlendirme Formatı:** `V{Sürüm}__{açıklama_yılan_yazımı}.sql` (örneğin: `V35__add_user_reputation_score.sql`). İki adet alt çizgi (`__`) zorunludur.
   - Silinmiş migration'ların kullandığı numaralar (V2–V9, V11–V13, V24–V32) eski veritabanı geçmişlerinde duruyor; tekrar kullanılmaz. Yeni dosya her zaman en büyük numaranın üstüne gelir.
   - Maven, kaynakta silinen veya yeniden adlandırılan dosyayı `target/classes/db/migration/` içinden kaldırmaz ve Flyway classpath'ten okuduğu için eski kopyayı uygular. Bir migration'ı sildikten veya yeniden adlandırdıktan sonra uygulamayı başlatmadan önce `./mvnw clean` çalıştırın.
3. **Idempotent ve Geriye Dönük Uyumluluk:**
   - Tablo oluştururken: `CREATE TABLE IF NOT EXISTS ...`
   - Kolon eklerken: `ADD COLUMN IF NOT EXISTS ...`
   - İndeks oluştururken: `CREATE INDEX IF NOT EXISTS ...`
4. **Veri Tipleri Standartları:**
   - Birincil anahtarlar: `UUID` veya `BIGINT GENERATED ALWAYS AS IDENTITY`.
   - Para miktarları: Kesinlikle `DECIMAL(19, 4)` veya `NUMERIC(15, 2)`. Float/Double yasaktır.
   - Zaman damgaları: `TIMESTAMP WITH TIME ZONE` veya `TIMESTAMP`.

### Boş Veritabanı ve Mevcut Veritabanları
- Boş bir veritabanı V1 → V1.1 → V10 … → V34 zinciriyle kurulur ve `ddl-auto: validate`'i geçer. V1.1, V10'un kullandığı `users.gender` kolonunu ekler; V34 şemayı entity modeliyle hizalar (eksik kolonlar, kısıtlar, `payment.order_id` tipi).
- `local` profilinde checksum doğrulaması açıktır ve `out-of-order: true`'dur. Uygulandıktan sonra düzenlenen bir migration başlangıçta hata verir.
- **Tek seferlik onarım:** V1 ve V18 uygulandıktan sonra düzenlendiği için, bu tarihten önce kurulmuş veritabanlarında ilk başlatma checksum hatasıyla durur. Bir kez şu komutu çalıştırın, sonra uygulamayı normal başlatın (V1.1, V33 ve V34 uygulanır; mevcut şemada V34 yalnızca `chk_users_gender` CHECK'ini kaldırır):
  ```bash
  ./mvnw org.flywaydb:flyway-maven-plugin:11.7.2:repair -Dflyway.url=jdbc:postgresql://localhost:5433/secondhand -Dflyway.user=postgres -Dflyway.password=postgres -Dflyway.locations=filesystem:src/main/resources/db/migration
  ```
- `prod` profilinde `out-of-order` kapalıdır. Geçmişi V1.1'in ötesinde olan bir prod veritabanında Flyway, V1.1'i "ignored" olarak raporlar ve validate hatasıyla durur. Repair'den sonra bir kez `SPRING_FLYWAY_OUT_OF_ORDER=true` ile başlatın.

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
