# ADR-0006: Değiştirilmez Flyway migration'ları

- **Durum:** Kabul edildi
- **Kapsam:** tüm şema (`src/main/resources/db/migration`)

## Bağlam
Hibernate `ddl-auto` ile şema üretmek prod'da kontrolsüz değişiklik riski taşır. Uygulanmış bir migration dosyası düzenlenirse Flyway checksum hatasıyla başlangıcı durdurur.

## Karar
Şema yalnızca Flyway ile yönetilir (`V<N>__*.sql`) ve uygulanmış dosyalar değiştirilmez; düzeltme yeni bir sürümle yapılır. Prod profili `ddl-auto: validate` kullanır, yani entity ile şema uyuşmazsa uygulama açılmaz.

## Sonuçlar
- Kazanç: Şema geçmişi izlenebilir; entity/şema sapması başlangıçta yakalanır.
- İstisna ve ders: V1 ve V18 uygulandıktan sonra düzenlendi. Bunu düzeltmek için V1.1, V33 ve V34 "catch-up" migration'ları eklendi. Bu tarihten önce kurulmuş veritabanları ilk başlatmada checksum hatası verir ve bir kez `flyway repair` gerektirir (adımlar [database-migration-and-seeding-guide.md](../database-migration-and-seeding-guide.md) içinde).
- Kural: Bu istisna tekrarlanmaz. Yanlış bir migration'ı düzenlemek yerine yeni sürüm yazın.

## Kod Referansları
[database-migration-and-seeding-guide.md](../database-migration-and-seeding-guide.md) · [data-model-and-er-diagram.md](../data-model-and-er-diagram.md)
