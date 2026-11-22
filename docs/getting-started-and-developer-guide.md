# Başlangıç ve Geliştirici Rehberi

Bu rehber projeyi ilk kez açan bir geliştirici içindir: kurulum, günlük çalışma akışı, test ve doğrulama komutları, sık karşılaşılan sorunlar. Mimari "neden" soruları için [README.md](README.md) içindeki deep dive'lara bakın.

## 1. Gereksinimler
- JDK 17, Maven 3.9+, Node.js 18+ ve npm, Docker ile Docker Compose.
- Python 3 (`scripts/` altındaki doğrulama script'leri için).

## 2. İlk Kurulum
1. `.env.template` dosyasını `.env` olarak kopyalayın. Yerel geliştirme için zorunlu olanlar `JWT_SECRET_KEY` ve veritabanı/Redis değerleridir. `GEMINI_API_KEY`, `CLOUDINARY_*` ve `GOOGLE_*` yoksa Aura, görsel yükleme ve Google ile giriş çalışmaz, geri kalan her şey çalışır.
2. `./scripts/start_all.sh --seed` Docker servislerini (PostgreSQL 5433, Redis 6379, Kafka 9092) kaldırır, backend'i ve frontend'i başlatır, katalog verisini yükler. Seed'siz başlatmak için `--seed` bayrağını çıkarın; belirli bir vertical için `--seed=vehicle,books` gibi key verin (key listesi: [database-migration-and-seeding-guide.md](database-migration-and-seeding-guide.md)).
3. Frontend `http://localhost:5173`, backend `http://localhost:8080/api/v1`, Swagger UI `http://localhost:8080/swagger-ui.html` adresindedir (Swagger `prod` profilinde kapalıdır).

Geliştirme ortamında SMTP yoktur: e-postalar `emails` tablosuna yazılır ve uygulamadaki gelen kutusunda (`/inbox`) görünür. Doğrulama kodları ve bildirim e-postaları buradan okunur.

## 3. Depo Düzeni
| Yol | İçerik |
| :--- | :--- |
| `src/main/java/com/serhat/secondhand/<modül>/` | Backend modülleri; her birinin `README.md` hub'ı iş kurallarını ve giriş noktalarını verir |
| `src/main/resources/db/migration/` | Flyway migration'ları (değiştirilmez, yeni numara eklenir) |
| `src/main/resources/data/` | Katalog seed JSON'ları |
| `secondhand-frontend/src/<modül>/` | React modülleri (`pages`, `components`, `hooks`, `services`) |
| `docs/` | Mimari deep dive'lar, runbook, ADR'ler |
| `scripts/` | `start_all.sh`, `verify.sh`, `check_docs.py`, `check_api_endpoints.py`, `check_no_emoji.py`, `project_report/` |

Backend akışı her zaman `controller -> service -> validator/policy -> repository -> mapper` sırasındadır. Controller'da iş mantığı, response'ta ham JPA entity olmaz.

## 4. Günlük Çalışma Akışı
1. Değiştireceğiniz modülün hub `README.md` dosyasını okuyun (Key Entry Points, iş kuralları, API listesi).
2. Para, stok, kimlik gibi yüksek riskli modüllerde değişiklikle birlikte, düzeltmeyi olmadan başarısız olan bir unit test ekleyin.
3. Yeni veya değişen iş kuralı, kolon ya da API şekli, hub README'yi ve adı geçen `docs/*.md` dosyalarını aynı değişiklikte günceller.
4. Veritabanı şeması yalnızca yeni bir `V<N>__açıklama.sql` migration'ı ile değişir; çalışmış bir migration'a dokunulmaz ([adr/0006-immutable-flyway-migrations.md](adr/0006-immutable-flyway-migrations.md)).
5. Commit'lerde ve arayüzde emoji kullanılmaz; ikonlar `lucide-react`'tendir.

## 5. Test ve Doğrulama
| Komut | Ne yapar |
| :--- | :--- |
| `mvn test` | Spring context açmayan Mockito unit testleri (varsayılan) |
| `mvn test -Dtest=<Sınıf>` | Tek test sınıfı |
| `mvn -B verify` | Testler + JaCoCo kapsama raporu (CI'ın çalıştırdığı komut) |
| `mvn test -Pintegration-tests -Dtest=ConcurrentStockAndPaymentIntegrationTest` | Docker gerektiren entegrasyon testi; dev veritabanı stoğunu değiştirir, önce haber verin |
| `cd secondhand-frontend && npm run lint && npm run build` | Frontend lint ve build |
| `python3 scripts/check_docs.py --changed` | Değişen sınıfları adıyla anan ama güncellenmemiş dokümanları hatırlatır (uyarı) |
| `python3 scripts/project_report/build_project_report.py` | Proje raporu PDF'ini koddaki gerçek değerlerden üretir; `pip install -r scripts/project_report/requirements.txt` gerekir, CI'da da çalışır |
| `./scripts/verify.sh` | Doküman tutarlılığı, API route eşleşmesi, emoji taraması ve frontend lint |

CI (`.github/workflows/ci.yml`) backend `mvn -B verify` ile frontend build ve `verify.sh` işlerini her push ve pull request'te çalıştırır.

## 5.1 Hata Ayıklama İpuçları
- **Outbox ve Kafka:** takılan event'ler ve DLT için [operations-runbook.md](operations-runbook.md).
- **Stok farkı** Redis ile PostgreSQL arasında: [stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md).
- **Hata kodları:** her domain'in `ErrorCode` enum'u ve HTTP eşlemesi [error-handling-and-contract-architecture.md](error-handling-and-contract-architecture.md) içindedir.

## 6. Sık Karşılaşılan Sorunlar
| Belirti | Sebep ve çözüm |
| :--- | :--- |
| Başlangıçta Flyway checksum hatası | Eski bir veritabanında V1 ve V18 sonradan düzenlenmişti; tek seferlik `flyway repair` komutu [database-migration-and-seeding-guide.md](database-migration-and-seeding-guide.md) içinde. Dev veritabanına çalıştırmadan önce sorun. |
| Yeni migration (ör. V60, V61) uygulanmadı | Backend'i yeniden başlatın; Flyway başlangıçta uygular. |
| `connection refused` 5433, 6379 veya 9092 | Docker servisleri kalkmamış: `docker compose up -d`. |
| Cache'ten eski veri geliyor | Cache anahtarı `v4:` önekli; seed ve yazma işlemleri evict eder, gerekirse [multi-tier-redis-caching-and-invalidation.md](multi-tier-redis-caching-and-invalidation.md). |
| Aura veya görsel yükleme çalışmıyor | `GEMINI_API_KEY` veya `CLOUDINARY_*` değerleri `.env` içinde boş. |
| 429 yanıtı | Rate limit; sınırlar `.env` içindeki `RATE_LIMIT_*` değerleriyle ayarlanır ([rate-limiting-and-throttling-architecture.md](rate-limiting-and-throttling-architecture.md)). |

## 7. Sonraki Okumalar
- Ürünün kullanıcı gözünden akışı: [product-overview-and-user-journeys.md](product-overview-and-user-journeys.md).
- Para akışı: [checkout-pipeline-and-distributed-transaction-flow.md](checkout-pipeline-and-distributed-transaction-flow.md), ardından escrow ve sipariş yaşam döngüsü.
- Neden bu kararlar alındı: [adr/README.md](adr/README.md).
