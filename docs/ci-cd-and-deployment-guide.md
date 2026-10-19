# CI/CD, Dağıtım ve Altyapı İşletim Kılavuzu

Bu doküman, **secondHand** platformunun yerel geliştirme altyapısını, Docker konteyner yapılandırmasını, ortam değişkenlerini (`.env`), üretim profili (`prod`) güvenlik kontrollerini ve gözlemlenebilirlik (Observability) ayarlarını açıklamaktadır.

---

## 1. Altyapı ve Servis Bağımlılıkları

Platform üç temel altyapı servisine bağımlıdır:

| Servis | İmaj | Port (Host:Container) | Açıklama |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 15** | `postgres:15-alpine` | `5433:5432` | İlişkisel veritabanı, ACID işlemler, Outbox tabloları. |
| **Redis 7** | `redis:7-alpine` | `6379:6379` | In-memory stok kilidi, Lua scriptleri, token kara listesi, önbellek. |
| **Apache Kafka 3.7** | `apache/kafka:3.7.0` | `9092:9092` | KRaft modunda zookeeper'sız olay dağıtımı, 3 partition. |

### Başlatma Komutu:
```bash
docker-compose up -d
```

---

## 2. Ortam Değişkenleri Şablonu (`.env`)

Uygulama başlamadan önce `.env.template` dosyasından `.env` kopyalanmalı ve şu kritik anahtarlar tanımlanmalıdır:

```properties
# Güvenlik & JWT
JWT_SECRET_KEY=en_az_32_karakterli_guclu_gizli_anahtar_buraya_yazilmalidir

# Yapay Zeka (Gemini)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_MODEL=gemini-3.1-flash-lite
GEMINI_API_FALLBACK_MEMORY_MODEL=gemini-2.0-flash-lite

# Bulut Depolama (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Google OAuth2 SSO
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Dış Döviz Kuru API
EXCHANGE_API_KEY=your_exchange_api_key
```

---

## 3. Üretim Profili ve Prod Security Guard

Uygulama `prod` profiliyle başlatıldığında ([`ProdSecurityGuard.java`](../src/main/java/com/serhat/secondhand/core/config/ProdSecurityGuard.java)) şu kontrolleri zorunlu kılar:
1. `jwt.secretKey` tanımlanmamışsa veya 32 karakterden kısaysa uygulama başlamaz.
2. `app.auth.cookie.secure = true` olmalıdır (`HttpOnly`, `SameSite=Strict/Lax`).
3. CORS allowlist içinde `localhost` veya wildcard (`*`) bulunamaz.

---

## 4. Gözlemlenebilirlik (Observability & Metrics)

- **Actuator Endpoint:** `/actuator/health`, `/actuator/info`
- **Prometheus Metrikleri:** `/actuator/prometheus` (HTTP gecikmeleri, JVM bellek havuzları, HikariCP bağlantı havuzu doluluğu, Kafka consumer lag metrikleri).
- **Swagger / OpenAPI:** `secondhand-openapi.json` üzerinden API sözleşmesi doğrulanır; Swagger UI yalnızca `prod` profilinde yapılandırılmış güvenli yollardan erişilebilir.
