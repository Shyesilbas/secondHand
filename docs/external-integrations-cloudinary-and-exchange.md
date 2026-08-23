# Dış Entegrasyonlar: Cloudinary (Görsel Depolama) & Exchange Rate API Rehberi

Bu doküman, **secondHand** platformundaki **Cloudinary (Bulut Görsel Yönetimi & CDN)** ve **ExchangeRate-API (Döviz Kuru Çevirici)** dış servis entegrasyonlarının çalışma prensiplerini, önbellekleme stratejilerini ve yapılandırmalarını özetlemektedir.

---

## 1. Cloudinary (Görsel Depolama ve CDN)

İlan fotoğrafları ve kullanıcı profil resimleri doğrudan uygulama sunucusunda veya veritabanında saklanmaz; küresel CDN hızlandırması ve görsel optimizasyonu için **Cloudinary** bulut servisi kullanılır.

### A. Mimari Akış ve Kullanım
* **Yükleme (`uploadImage`):**
  - İstemci `POST /api/images/upload` üzerinden `MultipartFile` gönderir.
  - [`CloudinaryService.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/cloudinary/application/CloudinaryService.java) dosyayı `secondhand/listings` klasörüne yükler ve dönen güvenli HTTPS URL'ini (`secure_url`) veritabanına kaydeder.
* **Silme (`deleteImage`):**
  - İlan silindiğinde veya görsel güncellendiğinde görsel URL'inden `public_id` ayrıştırılır ve Cloudinary üzerinden `destroy(publicId)` ile fiziksel olarak silinir.

### B. Ortam Değişkenleri ([`application-core.yml`](file:///Users/serhat/IdeaProjects/secondHand/src/main/resources/config/application-core.yml))
```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}
```

---

## 2. Exchange Rate API (Döviz Kuru Entegrasyonu)

Platformda farklı para birimlerinde fiyat görüntüleme ve kur çevrimi için **ExchangeRate-API (v6)** servisi kullanılır.

### A. Mimari Akış ve 2 Saatlik Redis Önbellek
* **Endpoint:** `GET /api/v1/exchange-rates?from=USD&to=TRY`
* **Dış API Çağrısı:** `https://v6.exchangerate-api.com/v6/{apiKey}/pair/{base}/{target}`
* **Önbellekleme (Tier 2 Redis Cache):**
  - Harici API kota aşımını önlemek ve yanıt süresini < 5 ms seviyesinde tutmak için [`ExchangeRateService.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/exchange/application/ExchangeRateService.java) üzerinde **2 saatlik Redis cache** devrededir:
    ```java
    @Cacheable(value = "exchangeRates", key = "#from.toUpperCase() + '_' + #to.toUpperCase()")
    public ExchangeRateDto getRate(String from, String to) { ... }
    ```

### B. Ortam Değişkenleri
```yaml
exchange:
  api:
    key: ${EXCHANGE_API_KEY}
```

---

## 3. Özet Entegrasyon Matrisi

| Servis | Protokol / Kütüphane | Cache Stratejisi | Hata Durumu (Fallback) |
| :--- | :--- | :--- | :--- |
| **Cloudinary** | Cloudinary Java SDK | Cloudinary Global CDN | `BusinessException("Failed to upload image")` |
| **ExchangeRate-API** | HTTP REST (RestTemplate) | **Tier 2 (2 Saat TTL Redis)** | Servis kesintisinde `503 SERVICE_UNAVAILABLE` |
