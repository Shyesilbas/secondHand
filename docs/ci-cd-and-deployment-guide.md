# CI/CD, Dağıtım ve Altyapı İşletim Kılavuzu

Bu doküman, **secondHand** platformunun yerel geliştirme altyapısını, Docker yapılandırmasını, ortam değişkenlerini (`.env`), `prod` profili güvenlik kontrollerini ve observability ayarlarını açıklar.

> [!NOTE]
> Repoda `.github/` dizini ve CI workflow dosyası yoktur; build/test/deploy otomasyonu repo içinde tanımlı değildir. Aşağıdakiler yalnızca repodaki `docker-compose.yml`, `scripts/start_all.sh` ve Spring config dosyalarını kapsar.

---

## 1. Altyapı ve Servis Bağımlılıkları

[`docker-compose.yml`](../docker-compose.yml) üç servis tanımlar (hepsi `restart: unless-stopped`, named volume'lu):

| Servis | İmaj | Port (Host:Container) | Kullanım |
| :--- | :--- | :--- | :--- |
| PostgreSQL | `postgres:15-alpine` | `5433:5432` | Veritabanı (`secondhand`), Flyway migration'ları, outbox tabloları. `DB_USER`/`DB_PASSWORD` yoksa `postgres`/`postgres`. |
| Redis | `redis:7-alpine` | `6379:6379` | Stok/kupon Lua rezervasyonları, lock'lar, cache, token blacklist. |
| Kafka | `apache/kafka:3.7.0` | `9092:9092` | KRaft (single node, broker+controller), `KAFKA_NUM_PARTITIONS=3`, replication factor 1. Advertised listener `localhost:9092`. |

Prometheus ve Grafana compose'a dahil değildir; metrikler `/actuator/prometheus` üzerinden dışarı aktarılır.

```bash
docker compose up -d        # yalnızca altyapı
./scripts/start_all.sh [--seed | --seed=<key[,key]|listing|all>]   # altyapı + backend (mvn spring-boot:run) + frontend (npm run dev)
```

`scripts/start_all.sh` `docker compose` ya da `docker-compose` bulur, `--seed` verilirse `APP_SEED` ortam değişkenini backend'e geçirir.

> [!WARNING]
> Kafka tek node ve replication factor 1 ile çalışır; bu compose yalnızca geliştirme içindir.

---

## 2. Ortam Değişkenleri (`.env`)

`.env.template` dosyasından `.env` oluşturulur. Şablondaki gruplar:

| Grup | Değişkenler |
| :--- | :--- |
| Database / Redis | `DB_URL`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT` |
| JWT | `JWT_SECRET_KEY` (**base64** kodlu; decode edilince en az 32 byte) |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_SCOPE`, `REDIRECT_URI`, `ISSUER_URI` |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Gemini | `GEMINI_API_KEY`, `GEMINI_API_MODEL`, `GEMINI_API_BASE_URL`, `GEMINI_API_FALLBACK_MEMORY_MODEL` (varsayılanlar `application-core.yml` içinde: `gemini-3.1-flash-lite`) |
| Exchange | `EXCHANGE_API_KEY` |
| App | `FRONTEND_URL`, `COOKIE_DOMAIN`, `CORS_ALLOWED_ORIGINS` |
| Rate limit | `RATE_LIMIT_ENABLED`, `RATE_LIMIT_AUTH`, `RATE_LIMIT_PAYMENT`, `RATE_LIMIT_GENERAL`, `RATE_LIMIT_AI`, `RATE_LIMIT_WINDOW` |

Rate limit varsayılanları ([`application-app.yml`](../src/main/resources/config/application-app.yml)): payment 10, auth 20, ai 15, general 150 istek / 60 sn; pencere 60 sn. Template'te olmayan ama config'te okunanlar: `COOKIE_SECURE` (varsayılan `false`), `COOKIE_SAME_SITE` (`Lax`), `CORS_ALLOW_CREDENTIALS` (`true`), `RATE_LIMIT_TRUSTED_PROXIES`, `MANAGEMENT_SERVER_PORT` (prod, `9090`).

---

## 3. Profiller ve Prod Security Guard

Varsayılan profil `local`'dir (`spring.profiles.default`). Prod için `SPRING_PROFILES_ACTIVE=prod` verilir; [`application-prod.yml`](../src/main/resources/application-prod.yml) `ddl-auto: validate` ve Flyway (`classpath:db/migration`, `baseline-on-migrate`) kullanır.

[`ProdSecurityGuard`](../src/main/java/com/serhat/secondhand/core/config/ProdSecurityGuard.java) `@PostConstruct` içinde tüm hataları toplar ve biri varsa `IllegalStateException` ile uygulamayı başlatmaz:

1. `jwt.secretKey` boş olamaz, geçerli base64 olmalı ve decode edilince ≥ 32 byte olmalı.
2. `app.rate-limit.enabled = true` olmalı.
3. `management.endpoints.web.exposure.include` içinde `*`, `env`, `configprops`, `beans`, `heapdump`, `threaddump`, `loggers`, `mappings`, `shutdown`, `logfile` bulunamaz.
4. `app.auth.cookie.secure = true` olmalı ve `same-site` boş olamaz.
5. `app.cors.allowed-origins` boş olamaz; `localhost`/`127.0.0.1` içeremez; `allow-credentials=true` iken `*` içeremez.

> [!IMPORTANT]
> `COOKIE_SECURE` varsayılanı `false` olduğu için prod'da `COOKIE_SECURE=true` ve `CORS_ALLOWED_ORIGINS` açıkça verilmelidir; aksi halde guard başlangıçta hata verir.

---

## 4. Observability

| Profil | Exposure | Port |
| :--- | :--- | :--- |
| `local` | `health,info,metrics,prometheus` | uygulama portu (8080) |
| `prod` | `health,info,prometheus` | ayrı management portu `MANAGEMENT_SERVER_PORT` (varsayılan `9090`) |

- Prod'da `/actuator/prometheus` 8080'de yayınlanmaz; management portu yalnızca iç ağdan (Prometheus, probe'lar) erişilebilir olmalıdır.
- Metric'ler `application=<spring.application.name>` tag'i taşır.
- Swagger/OpenAPI: path'ler `/v3/api-docs` ve `/swagger-ui.html`; **prod'da `springdoc.api-docs.enabled=false` ve `swagger-ui.enabled=false`**, yani prod'da erişilemez.

