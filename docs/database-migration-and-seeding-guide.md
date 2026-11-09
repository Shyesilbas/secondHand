# Veritabanı Migration ve Seeding Kılavuzu

Bu doküman, **secondHand** platformunun PostgreSQL veritabanı şema versiyonlama kurallarını (**Flyway**), migration yazma standartlarını ve JSON katalog (**Seeding Pipeline**) mimarisini açıklamaktadır.

---

## 1. Flyway Şema Versiyonlama Kuralları

Veritabanı değişiklikleri yalnızca [`src/main/resources/db/migration/`](../src/main/resources/db/migration/) altındaki SQL dosyaları ile yapılır.

### Katı Kurallar:
1. **Asla Mevcut Migrationu Düzenleme:** Yayınlanmış veya merge edilmiş hiçbir `V<N>__*.sql` dosyası değiştirilemez veya silinemez. Değişiklik ihtiyacı olduğunda her zaman yeni bir `V<N+1>__aciklama.sql` dosyası oluşturulur.
2. **İsimlendirme Formatı:** `V{Sürüm}__{açıklama_yılan_yazımı}.sql` (örneğin: `V<N>__add_user_reputation_score.sql`). İki adet alt çizgi (`__`) zorunludur.
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
- Boş bir veritabanı V1 → V1.1 → V10 … → en büyük sürüm zinciriyle kurulur ve `ddl-auto: validate`'i geçer. V1.1, V10'un kullandığı `users.gender` kolonunu ekler; V34 şemayı entity modeliyle hizalar (eksik kolonlar, kısıtlar, `payment.order_id` tipi).
- `local` profilinde checksum doğrulaması açıktır ve `out-of-order: true`'dur. Uygulandıktan sonra düzenlenen bir migration başlangıçta hata verir.
- **Tek seferlik onarım:** V1 ve V18 uygulandıktan sonra düzenlendiği için, bu tarihten önce kurulmuş veritabanlarında ilk başlatma checksum hatasıyla durur. Bir kez şu komutu çalıştırın, sonra uygulamayı normal başlatın (V1.1, V33 ve V34 uygulanır; mevcut şemada V34 yalnızca `chk_users_gender` CHECK'ini kaldırır):
  ```bash
  ./mvnw org.flywaydb:flyway-maven-plugin:11.7.2:repair -Dflyway.url=jdbc:postgresql://localhost:5433/secondhand -Dflyway.user=postgres -Dflyway.password=postgres -Dflyway.locations=filesystem:src/main/resources/db/migration
  ```
- `prod` profilinde `out-of-order` kapalıdır. Geçmişi V1.1'in ötesinde olan bir prod veritabanında Flyway, V1.1'i "ignored" olarak raporlar ve validate hatasıyla durur. Repair'den sonra bir kez `SPRING_FLYWAY_OUT_OF_ORDER=true` ile başlatın.

---

## 2. Katalog ve JSON Seeding Pipeline

Marka, model, tip, il/ilçe ve teknik özellik verisi SQL'e satır satır yazılmaz; [`src/main/resources/data/`](../src/main/resources/data/) altındaki JSON dosyalarından yüklenir. Dosya haritası ve sayılar [catalog-and-category-polymorphism.md §4](catalog-and-category-polymorphism.md#4-katalog-json-verisi) içindedir.

> `src/main/resources/data/` dizini [.gitignore](../.gitignore) ile repoya dahil edilmez. Seed çalıştırmak için dizinin yerel kopyası gerekir; bu dizine verilen linkler GitHub'da açılmaz.

### Seed çalıştırma
Seed'ler uygulama açılışında kendiliğinden çalışmaz. [`CatalogSeedStartupRunner`](../src/main/java/com/serhat/secondhand/core/seed/CatalogSeedStartupRunner.java) yalnızca `app.seed` (veya `APP_SEED`) verildiğinde istenen `SeedTask`'leri çalıştırır:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--app.seed=vehicle,electronics
APP_SEED=all ./mvnw spring-boot:run
```

| Key | Görev | Not |
| :--- | :--- | :--- |
| `vehicle`, `electronics`, `clothing`, `books`, `sports`, `realestate`, `attributes` | Kategori katalogları (`*DataInitializer`, `ListingAttributeDataInitializer`) | `listing` grubu bu yedisini birlikte çalıştırır |
| `agreements` | `AgreementDataInitializer` | |
| `listings-generate`, `listings-clean` | `ListingGeneratorSeedTask`, `GeneratedListingCleanupTask` | Katalog dışı veri yazar; `all` içinde **çalışmaz**, yalnızca adıyla çağrılır |

`all`, explicit-only olanlar dışındaki tüm key'leri çalıştırır. Bilinmeyen bir key `IllegalArgumentException` ile açılışı durdurur ve mevcut key'leri listeler.

### Seeding yaşam döngüsü
1. **Transaction:** Her `SeedTask` kendi transaction'ında çalışır. Hata `Result`'ı veya exception rollback yapar ve açılış `IllegalStateException` ile durur; yarım kalmış referans taşıma olmaz.
2. **Upsert + prune:** Seed'ler upsert yapar. JSON'dan çıkarılan satırlar yalnızca hiçbir foreign key onları göstermiyorsa silinir: vehicle, clothing, books, sports ve realestate için [`CatalogLegacyPruner`](../src/main/java/com/serhat/secondhand/core/seed/CatalogLegacyPruner.java), electronics model varyantları için `deleteStaleUnreferenced`, attribute tanımları için `ListingAttributeDataInitializer`. Hâlâ referans edilen eski satır korunur; tekrarlayan satırları birleştirip ilan FK'larını taşımak yalnızca `app.seed.merge-legacy-duplicates=true` ile yapılır.
3. **Cache invalidation:** Tüm seed'ler bittikten sonra runner `catalog:` ile başlayan Spring cache'lerini temizler. Lokasyon kataloğu bu akışın dışındadır: `LocationCatalogService` açılışta (`@PostConstruct`) `v6:catalog:locations:*` Redis anahtarlarını kontrol eder, yoksa `data/common/locations.json`'dan yükler.

---

## 3. Yeni Migration Ekleme Adımları (Checklist)

1. Son sürüm numarasını kontrol edin (`ls src/main/resources/db/migration/`).
2. Yeni sürüm dosyasını oluşturun (`V<N+1>__aciklama.sql`).
3. DDL scriptini yazın ve indeks gereksinimlerini belirleyin (özellikle sorgu filtreleri ve yabancı anahtarlar için indeks ekleyin).
4. İlgili JPA entity sınıfına yeni alanları ekleyin.
5. Uygulamayı yerel profilde başlatıp Flyway loglarını doğrulayın:
   ```bash
   ./mvnw spring-boot:run
   ```
