# İade ve İptal Sistemi

## Genel Bakış

SecondHand platformunda kullanıcılar sipariş verdikten sonra 1 saat içinde iade talebi oluşturabilirler. Her sipariş kalemi ayrı ayrı iade edilebilir.

## Özellikler

### 1. İade Talebi Oluşturma
- ✅ Sipariş oluşturulduktan sonra **1 saat içinde** iade hakkı
- ✅ Her ürün **ayrı ayrı** iptal edilebilir (kısmi iade)
- ✅ İade talebi oluştururken **sebep belirtme** zorunlu (min 10, max 1000 karakter)
- ✅ Para iadesi kullanılan **ödeme yöntemine** geri yapılır

### 2. İade Süreci
- ✅ İade talebi oluşturulunca otomatik **PENDING** durumuna geçer
- ✅ 1 saat sonra scheduled task ile otomatik **işleme alınır**
- ✅ İade süreci: `PENDING → PROCESSING → APPROVED → COMPLETED`
- ✅ Toplam süre: ~1 saat (mock)

### 3. İade Durumları
- **PENDING**: İade talebi oluşturuldu
- **PROCESSING**: İade işlemi devam ediyor
- **APPROVED**: İade onaylandı
- **COMPLETED**: İade tamamlandı, para iade edildi
- **REJECTED**: İade reddedildi
- **CANCELLED**: İade talebi iptal edildi

## Backend Yapısı

### Entity'ler
```
refund/
├── entity/
│   ├── RefundRequest.java      # Ana iade talebi entity
│   └── RefundStatus.java        # İade durumu enum
├── dto/
│   ├── RefundRequestDto.java
│   └── CreateRefundRequestDto.java
├── repository/
│   └── RefundRequestRepository.java
├── mapper/
│   └── RefundMapper.java
├── service/
│   └── RefundService.java       # İş mantığı
├── controller/
│   └── RefundController.java    # REST endpoints
└── scheduler/
    └── RefundScheduler.java     # Otomatik işleme
```

### API Endpoints

#### İade Talebi Oluştur
```http
POST /api/v1/refunds
Content-Type: application/json

{
  "orderId": 1,
  "orderItemId": 5,
  "reason": "Ürün beklentimi karşılamadı..."
}
```

#### Kullanıcının İade Taleplerini Listele
```http
GET /api/v1/refunds?page=0&size=10
```

#### Sipariş İade Taleplerini Listele
```http
GET /api/v1/refunds/order/{orderId}?page=0&size=10
```

#### İade Talebini Getir
```http
GET /api/v1/refunds/{id}
```

#### İade Talebini İptal Et
```http
DELETE /api/v1/refunds/{id}
```

#### Sipariş İptal Edilebilir Mi?
```http
GET /api/v1/refunds/can-cancel/order/{orderId}
```

#### Sipariş Kalemi İptal Edilebilir Mi?
```http
GET /api/v1/refunds/can-cancel/order-item/{orderItemId}
```

### İş Mantığı

#### 1. İade Talebi Oluşturma Kontrolleri
- ✅ Kullanıcının siparişi olup olmadığı
- ✅ Sipariş ödenmiş mi (`PAID` durumunda)
- ✅ 1 saat iptal hakkı dolmamış mı
- ✅ Daha önce bu item için aktif iade talebi yok mu

#### 2. Otomatik İşleme (Scheduled Task)
```java
@Scheduled(fixedRate = 600000) // Her 10 dakikada bir
public void processPendingRefunds()
```
- 1 saatten eski PENDING durumundaki iade taleplerini bulur
- Her birini sırayla işler:
  - `PENDING → PROCESSING → APPROVED → COMPLETED`
  - Para iadesini gerçekleştirir
  - Sipariş durumunu günceller

#### 3. Para İadesi
- Satıcıdan alıcıya para transferi
- Payment kaydı oluşturulur (`REFUND` transaction type)
- Refund reference kaydedilir

## Frontend Yapısı

### Dosya Yapısı
```
refund/
├── services/
│   └── refundService.js         # API çağrıları
├── hooks/
│   └── useRefunds.js            # Custom hooks
├── components/
│   ├── CreateRefundModal.jsx    # İade talebi oluşturma modal
│   ├── RefundCard.jsx           # İade kartı
│   └── RefundStatusBadge.jsx    # Durum rozeti
├── pages/
│   └── RefundsPage.jsx          # İade talepleri sayfası
└── refund.js                    # Constants & utils
```

### Kullanıcı Akışı

#### 1. Siparişlerimde İptal Butonu
- Sipariş detayında her ürünün yanında "İade Talebi Oluştur" butonu
- Buton sadece 1 saat içinde görünür
- Zaten iade talebi olan ürünlerde buton görünmez

#### 2. İade Talebi Oluşturma
- Modal açılır
- Ürün bilgileri gösterilir
- Sebep girişi yapılır (min 10 karakter)
- Uyarı mesajları gösterilir

#### 3. İade Takibi
- `/refunds` sayfasından tüm iade talepleri görülebilir
- Durum bilgileri görüntülenir
- PENDING durumundayken iptal edilebilir

### Navigasyon
- Header → User Menu → "Refunds"
- Route: `/refunds`

## Kullanım Örneği

### Senaryo: 2 Farklı Satıcıdan Ürün Alımı

1. **Sipariş Verme**
   - Kullanıcı 2 farklı satıcıdan toplam 2 ürün alır
   - Sipariş oluşturulur (createdAt: 14:00)

2. **İptal Hakkı**
   - 14:00 - 15:00 arası: Her iki ürün için de iade talebi oluşturulabilir
   - 15:00 sonrası: İptal hakkı sona erer

3. **Kısmi İade**
   - Kullanıcı sadece 1. ürün için iade talebi oluşturur
   - 2. ürün siparişe devam eder
   - İade nedeni: "Ürün beklentimi karşılamadı"

4. **İade Süreci**
   - İade talebi PENDING durumunda oluşturulur (14:30)
   - Scheduled task 15:30'da çalışır
   - İade otomatik işlenir:
     - 15:30:00 → PROCESSING
     - 15:30:01 → APPROVED
     - 15:30:02 → COMPLETED
   - Para e-cüzdana iade edilir

5. **Sipariş Durumu**
   - 1. ürün: REFUNDED
   - 2. ürün: PAID (devam ediyor)
   - Order status: CONFIRMED (kısmi iade)

## Önemli Notlar

### ⚠️ Dikkat Edilmesi Gerekenler

1. **Zaman Kontrolü**
   - Sipariş `createdAt` tarihinden itibaren 1 saat hesaplanır
   - `ChronoUnit.HOURS.between()` kullanılır

2. **Aktif İade Kontrolü**
   - PENDING, PROCESSING, APPROVED durumlarında aktif iade var sayılır
   - Aynı item için birden fazla aktif iade olamaz

3. **Para İadesi**
   - Default olarak E-WALLET'a yapılır
   - `determineRefundMethod()` ile ödeme metodu belirlenir

4. **Sipariş Durumu**
   - Tüm itemlar iade edilirse order status → REFUNDED
   - Kısmi iade de sipariş devam eder

### 🔄 Gelecek Geliştirmeler

- [ ] Admin panelinde manuel iade onayı
- [ ] İade nedeni kategorileri
- [ ] Fotoğraf ekleme desteği
- [ ] Email bildirimleri
- [ ] İade onay/ret nedeni
- [ ] Ödeme metoduna göre farklı iade süreleri

## Test Senaryoları

### 1. Başarılı İade
```
1. Sipariş oluştur
2. 30 dakika içinde iade talebi oluştur
3. Scheduled task'in çalışmasını bekle (10 dk)
4. İade durumunu kontrol et (COMPLETED olmalı)
5. Para iadesini kontrol et
```

### 2. Süre Dolmuş İade
```
1. Sipariş oluştur
2. 1 saatten fazla bekle
3. İade talebi oluşturmayı dene
4. Hata mesajı alınmalı: "Cancellation period has expired"
```

### 3. Kısmi İade
```
1. 2 itemli sipariş oluştur
2. Sadece 1 item için iade talebi oluştur
3. Scheduled task çalışsın
4. Order status REFUNDED olmamalı
5. Sadece iade edilen item için refund kaydı olmalı
```

### 4. Çift İade Önleme
```
1. Sipariş oluştur
2. Item için iade talebi oluştur
3. Aynı item için tekrar iade talebi oluşturmayı dene
4. Hata mesajı alınmalı: "A refund request already exists"
```

## Veritabanı

### refund_requests Tablosu
```sql
CREATE TABLE refund_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    refund_number VARCHAR(255) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
    reason VARCHAR(1000) NOT NULL,
    refund_method VARCHAR(50) NOT NULL,
    refund_reference VARCHAR(255),
    admin_notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Teknik Detaylar

### Dependencies
- Spring Boot Scheduling (@EnableScheduling)
- JPA Auditing (@CreatedDate, @LastModifiedDate)
- Lombok
- React
- Lucide Icons (frontend)

### Configuration
```properties
# Scheduling zaten aktif
@EnableScheduling annotation ile etkin
```

### Security
- Tüm endpoint'ler authentication gerektirir
- Kullanıcı sadece kendi iade taleplerini görebilir
- Order ownership kontrolü yapılır

---

**Geliştirme Tarihi**: Ekim 2025  
**Versiyon**: 1.0  
**Durum**: Tamamlandı ✅

