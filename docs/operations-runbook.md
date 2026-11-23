# Operasyon Runbook'u

Bu doküman çalışan sistemde sık görülen arıza durumları için adım adım müdahale prosedürlerini içerir. Mimari gerekçeler [redis-and-kafka-architecture.md](redis-and-kafka-architecture.md) ve [ADR'lerde](adr/README.md); ortam ve altyapı ayarları [ci-cd-and-deployment-guide.md](ci-cd-and-deployment-guide.md) içindedir. Buradaki SQL ve komutlar yerel Docker altyapısı (`secondhand_postgres_dev`, `secondhand_kafka_dev`) için yazılmıştır; prod'da kendi erişim yönteminizi kullanın.

> [!WARNING]
> Para akışındaki tablolara (`payment_outbox_events`, `order_outbox_events`, `escrow_outbox_events`, `escrows`, `ewallet`) elle `UPDATE` atmadan önce etkilenecek satırları `SELECT` ile görün ve bir yedek alın.

---

## 1. Hızlı Teşhis

| Belirti | Önce bakılacak | Bölüm |
| :--- | :--- | :--- |
| Ödeme tamamlandı ama stok düşmedi, satıcıya para gelmedi | Outbox tablosunda `PENDING` birikmesi veya `FAILED` kayıt | 2 |
| Mesaj tüketilmiyor, tekrar tekrar hata logu | `*.DLT` topic'inde mesaj | 3 |
| Ürün "stokta yok" ama kimse almamış, ya da aşırı satış | Redis ile PostgreSQL stok farkı | 4 |
| Uygulama açılışta Flyway checksum hatası verip duruyor | Eski veritabanı, catch-up migration | 5 |
| Prod'da uygulama başlamıyor, `IllegalStateException` | `ProdSecurityGuard` ihlali | 6 |
| Zamanlanmış iş (kampanya, sipariş tamamlama) çalışmıyor | Scheduler ve kilit | 7 |

Health ve metrikler: `local` profilinde uygulama portunda, prod'da yalnızca `MANAGEMENT_SERVER_PORT` (varsayılan `9090`) üzerinden `/actuator/health` ve `/actuator/prometheus`. Prometheus ve Grafana compose'da yoktur.

---

## 2. Outbox: Birikmiş veya `FAILED` Event

Üç worker vardır: `PaymentOutboxWorker` (`payment.completed.v1`), `EscrowOutboxWorker` (`escrow.released.v1`), `OrderOutboxWorker` (`order.cancelled.v1`, `order.refunded.v1`). Her biri 5 sn aralıkla `PENDING` ve zamanı gelmiş (`next_attempt_at`) kayıtları işler. Başarısız denemede `attempt_count` artar, `last_error` yazılır ve gecikme uzar; `max_attempts` (varsayılan 10) dolunca kayıt `FAILED` olur. Geri çekilme (*backoff*) formülleri [redis-and-kafka-architecture.md](redis-and-kafka-architecture.md) içindedir.

`FAILED` kayıtlar otomatik yeniden denenmez ve Housekeeping yalnızca `PROCESSED` kayıtları sildiği için `FAILED` satırlar sonsuza kadar kalır. Bunun için iki araç vardır:

- **Metrik:** `OutboxMetrics` her outbox için `PENDING` ve `FAILED` satır sayısını `secondhand_outbox_events{outbox="payment|order|escrow", status="PENDING|FAILED"}` gauge'u olarak yayınlar. Önerilen alarm: `secondhand_outbox_events{status="FAILED"} > 0`. `PENDING` değerinin uzun süre yüksek kalması worker'ın ya da Kafka'nın takıldığını gösterir.
- **Requeue endpoint'i:** `POST /api/v1/admin/outbox/{type}/{eventId}/requeue` (`type`: `payment`, `order`, `escrow`; yalnızca `ADMIN`). Yalnızca `FAILED` bir kaydı `PENDING` yapar, `attempt_count` sıfırlanır ve worker bir sonraki turda alır. Kayıt yoksa ya da `FAILED` değilse `409` ve `OUTBOX_EVENT_NOT_REQUEUEABLE` döner.

### 2.1 Durumu gör
```sql
SELECT status, count(*) FROM payment_outbox_events GROUP BY status;
SELECT status, count(*) FROM escrow_outbox_events  GROUP BY status;
SELECT status, count(*) FROM order_outbox_events   GROUP BY status;
```

### 2.2 `FAILED` kayıtların nedenini oku
```sql
SELECT id, event_type, attempt_count, last_error, created_at
FROM payment_outbox_events
WHERE status = 'FAILED'
ORDER BY created_at;
```

### 2.3 Nedeni gider, sonra yeniden kuyruğa al
Önce `last_error` altındaki kök nedeni çözün (Kafka erişilemez, payload bozuk, ilişkili kayıt silinmiş). Neden giderilmeden kuyruğa almak aynı hatayı üretir. Sonra admin oturumuyla:
```bash
curl -X POST -b cookies.txt -H "X-XSRF-TOKEN: <csrf>" \
  http://localhost:8080/api/v1/admin/outbox/payment/<event-id>/requeue
```
Endpoint kullanılamıyorsa eşdeğer SQL (`escrow_outbox_events` ve `order_outbox_events` için de aynıdır; `payment_outbox_events` ek olarak `updated_at` yazar):
```sql
UPDATE payment_outbox_events
SET status = 'PENDING', attempt_count = 0, next_attempt_at = now(), last_error = NULL
WHERE status = 'FAILED' AND id = '<event-id>';
```

> [!IMPORTANT]
> Yeniden gönderim güvenlidir çünkü consumer'lar `processed_kafka_events` ile mükerrer mesajı atlar. İstisna: ilgili anahtarın kaydı 3 günlük retention ile silinmişse ([ADR-0001](adr/0001-transactional-outbox-with-polling.md)) eski bir event ikinci kez işlenebilir. Çok eski bir `FAILED` kaydı kuyruğa almadan önce ilgili ödemenin/escrow'un güncel durumunu kontrol edin.

### 2.4 Hepsi `PENDING` ama hiçbiri işlenmiyor
Kafka erişimini kontrol edin; worker, broker ack'ini `app.outbox.publish-timeout-seconds` (varsayılan 15) kadar bekler ve zaman aşımı başarısız deneme sayılır. Loglarda `outbox processing failed` satırlarına bakın.
```bash
docker logs --tail 100 secondhand_kafka_dev
```

---

## 3. Kafka: Dead Letter Topic'leri

Consumer hata verirse `DefaultErrorHandler` mesajı 1 sn arayla 2 kez daha dener, sonra `<topic>.DLT` topic'ine yollar. DLT yalnızca tüketilen üç topic için tanımlıdır: `payment.completed.v1`, `escrow.released.v1`, `mail.dispatch.v1`. Tüketici grupları: `payment-completed-consumers`, `inventory-sync-consumers`, `escrow-released-consumers`, `mail-dispatch-consumers`.

`order.cancelled.v1` ve `order.refunded.v1` outbox worker'ı tarafından dış tüketiciler için yayınlanır, kodda listener'ları yoktur. `payment.failed.v1` ve `payment.refunded.v1` için `KafkaConfig` içinde yalnızca topic tanımı vardır; kodda ne publish eden ne listener olan vardır.

### 3.1 DLT'de mesaj var mı
```bash
docker exec secondhand_kafka_dev /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic escrow.released.v1.DLT \
  --from-beginning --timeout-ms 5000
```
Mesajın başlıkları (header) özgün hatayı taşır. Kök nedeni (örneğin `PaymentErrorCodes.ESCROW_RELEASE_EVENT_INVALID` ile bozuk event) bulun.

### 3.2 Yeniden işleme
DLT'den otomatik geri okuma yoktur. Kaynak kaydı hâlâ outbox'ta ise 2.3'teki gibi `PENDING` yapıp yeniden yayınlatın; consumer yalnızca nedeni giderildiyse başarılı olur. Kaynak kayıt temizlenmişse mesajı DLT'den alıp aslî topic'e elle yayınlamanız gerekir ve bu işlem öncesinde idempotency anahtarını (`escrow:release:{escrowId}` gibi) `processed_kafka_events` içinde kontrol etmelisiniz.

---

## 4. Stok: Redis ve PostgreSQL Farkı

Satılabilir stok Redis'te, kalıcı stok PostgreSQL'dedir ([ADR-0002](adr/0002-redis-lua-stock-reservation.md)). Kısa süreli fark normaldir; `StockReservationReconciliationScheduler` açıklanamayan farkı varsayılan 5 dakikada bir (`app.inventory.reconciliation.fixed-delay-ms`) düzeltir ve loglarda `[STOCK RECONCILIATION]` önekiyle yazar.

1. Önce loglarda `[STOCK RECONCILIATION]` satırlarına bakın; scheduler çalışıyor mu ve ilgili ilanı atlıyor mu (ör. "non-numeric hold; skipped").
2. Bir ilan için anahtarları görün (`{listingId}` yerine gerçek UUID):
```bash
docker exec secondhand_redis_dev redis-cli GET "v4:inventory:stock:{listingId}"
docker exec secondhand_redis_dev redis-cli KEYS "v4:inventory:*:{listingId}*"
```
3. PostgreSQL tarafı:
```sql
SELECT listing_id, available_quantity FROM inventory WHERE listing_id = '<listing-id>';
```
4. Anahtar semantiği ve düzeltme mantığı [stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md) içindedir. Scheduler farkı kapatmıyorsa Redis anahtarını elle yazmak yerine önce neden açıklanamadığını inceleyin ve bulguyu bir bug olarak kaydedin.

> [!NOTE]
> `KEYS` komutu yerel ortam içindir. Prod'da büyük keyspace'te `SCAN` kullanın.

---

## 5. Flyway Checksum Hatası

Belirti: eski bir veritabanında ilk açılış checksum hatasıyla durur. Neden ve tek seferlik onarım komutu [database-migration-and-seeding-guide.md](database-migration-and-seeding-guide.md) içindedir ([ADR-0006](adr/0006-immutable-flyway-migrations.md)). Yeni kurulumda bu hata beklenmez; alıyorsanız uygulanmış bir migration dosyasının düzenlenmiş olup olmadığını `git log -- src/main/resources/db/migration` ile kontrol edin.

---

## 6. Prod Başlangıç Hatası

`ProdSecurityGuard` tüm ihlalleri toplayıp tek `IllegalStateException` ile uygulamayı durdurur. Mesajdaki maddeleri gidermek için [ci-cd-and-deployment-guide.md](ci-cd-and-deployment-guide.md) 3. bölümündeki listeye bakın (JWT anahtarı, `RATE_LIMIT_ENABLED`, Actuator exposure, `COOKIE_SECURE`, CORS origin'leri).

---

## 7. Zamanlanmış İşler

Dağıtık çalışmada çift tetiklenmeyi ShedLock engeller (`@SchedulerLock`). Başlıca işler:

| Scheduler | Görev | Aralık |
| :--- | :--- | :--- |
| `OutboxHousekeepingScheduler` | `PROCESSED` outbox ve `processed_kafka_events` temizliği | Her gece 03:00 (`app.outbox.cleanup.cron`), retention 3 gün |
| `StockReservationReconciliationScheduler` | Redis/PostgreSQL stok farkı | 5 dk |
| `CartReservationScheduler` | Süresi dolan sepet rezervasyonu | 60 sn (`app.cart.scheduler.cleanup-fixed-rate-ms`) |
| `OrderCompletionScheduler` | Sipariş otomatik durum ve tamamlama | `OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES` |
| Outbox worker'ları | Kafka'ya yayın | 5 sn |

Bir iş çalışmıyorsa: loglarda başlangıç satırını arayın, uygulamanın birden fazla instance'ta çalışıp kilidi başka instance'ın tutup tutmadığını kontrol edin ve `lockAtMostFor` süresi dolana kadar bekleyin.

## 8. Komisyon Duyurusu ve Platform Ücretleri

- **Ayarlar** (`PlatformFeeConfig`, `app.platform`): `COMMISSION_EFFECTIVE_FROM` (komisyonun geçerli olduğu tarih, varsayılan 2026-11-22), `SHIPPING_FEE` (varsayılan 49,90), `FREE_SHIPPING_THRESHOLD` (varsayılan 1000; bu tutarın üzerindeki satıcı siparişlerinde kargoyu satıcı öder, 0 özelliği kapatır), `SYSTEM_ACCOUNT_EMAIL`.
- **Duyuru:** ADMIN oturumuyla `POST /api/v1/admin/announcements/commission` bir kez çağrılır, yanıt `{queued}` kuyruğa alınan kullanıcı sayısıdır. Aynı konuyu almış kullanıcılar atlanır; mail kaydı asenkron yazıldığı için art arda hızlı çağrı çift gönderebilir, tekrar çağırmadan önce kuyruğun işlenmesini bekleyin.
- **Sistem hesabı:** bakiyesi negatife düşebilir (platform kupon payı komisyondan önce çıkar); bakiyeyi `e_wallets` üzerinden sistem kullanıcısı için izleyin.
- **V62:** sistem kullanıcısı, komisyon kolonları ve kargo kolonlarını ekler; eski bir veritabanında uygulama yeniden başlatılınca uygulanır.
