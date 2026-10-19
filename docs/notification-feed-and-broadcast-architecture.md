# Bildirim Olay Dağıtımı ve Broadcast Feed Mimarisi

Bu doküman, **secondHand** platformundaki kullanıcı bildirim altyapısını oluşturan **Kişisel Bildirimler (`Notification`)**, **Toplu Sistem Duyuruları (`NotificationEvent`)**, **Birleşik Akış Projeksiyonu (`NotificationFeedRepository`)**, **Okundu Takip Mekanizması (`NotificationEventRead`)**, **WebSocket Canlı Push İletimi** ve **Rozet Önbellek Tahliyesi (`user:badges`)** mimarisini açıklamaktadır.

---

## 1. Problem Tanımı ve Fan-Out Tuzağı

Klasik bildirim sistemlerinde tüm kullanıcılara bir duyuru (örneğin kampanya başlangıcı, sözleşme güncellemesi veya sistem bakımı) gönderilmek istendiğinde, 100.000 kullanıcı için 100.000 ayrı veritabanı satırı yazılır (*High-Write Fan-Out Problem*). Bu durum:
1. Veritabanında disk ve indeks şişmesine neden olur.
2. Yazma gecikmesini (write latency) artırır ve transaction kilitlerine yol açar.

### secondHand Çözümü (Hibrit Feed Mimarisi):
Platformda iki ayrı veri modeli birleştirilmiştir:
1. **Kişiye Özel Bildirimler (`notifications`):** Sipariş durumu, teklif kabulü veya mesaj uyarıları gibi doğrudan tek bir kullanıcıyı ilgilendiren olaylar.
2. **Toplu Sistem Olayları (`notification_events`):** Tek bir satır olarak kaydedilen ve tüm kullanıcılara açık olan yayınlar.
3. **Kullanıcı Okuma Takibi (`notification_event_reads`):** Kullanıcı bir genel duyuruyu okuduğunda yalnızca `(userId, eventId)` eşleşmesi kaydedilir.

---

## 2. Mimari Akış ve Veri Modeli

```
[ Domain Olayı (Order / Payment / Agreement / Admin) ]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
(Kişisel Olay)               (Broadcast Olay)
        │                           │
        ▼                           ▼
[notificationRepository.save] [notificationEventRepository.save]
  (user_id, is_read=false)      (Tek Satır, user_id=null)
        │                           │
        ▼                           ▼
[webSocketService.sendToUser]  [webSocketService.sendBroadcast]
(/user/{id}/queue/notifications) (/topic/notifications.broadcast)
```

---

## 3. Akış Sorgulama ve Okundu Birleştirme (Feed Projection)

Kullanıcı bildirim merkezini açtığında (`GET /api/v1/notifications`), [`NotificationFeedRepository.java`](../src/main/java/com/serhat/secondhand/notification/repository/NotificationFeedRepository.java) iki tabloyu veritabanı seviyesinde tek bir sayfalanmış projeksiyona (`NotificationFeedRow`) birleştirir:

1. **SQL Birleştirme (Union Projection):**
   - Kullanıcının kendi `notifications` satırları.
   - `notification_events` tablosundaki kayıtlar (ilgili kullanıcının `notification_event_reads` tablosundaki okundu durumuyla sol birleşim yapılarak `is_read = (read_id IS NOT NULL)` şeklinde hesaplanır).
2. **Okunmamış Sayacı Hesabı (`getUnreadCount`):**
   ```java
   long personal = notificationRepository.countByUser_IdAndIsReadFalse(userId);
   long totalEvents = notificationEventRepository.count();
   long reads = notificationEventReadRepository.countByUserIdForEvents(userId);
   long broadcastUnread = Math.max(0, totalEvents - reads);
   return personal + broadcastUnread;
   ```
3. **Okundu Olarak İşaretleme (`markAsRead`):**
   - Bildirim kişisel bir `Notification` ise `isRead = true` yapılır.
   - Bildirim genel bir `NotificationEvent` ise `notification_event_reads` tablosuna idempotent `(userId, eventId)` satırı eklenir.
   - Her okundu işleminde `@CacheEvict(value = "user:badges", key = "#userId")` tetiklenerek önbellekteki okunmamış rozet sayısı anında sıfırlanır.

---

## 4. Olay Dinleyicileri (Event Listeners)

Bildirimler doğrudan controller çağrılarıyla değil, asenkron Spring domain olayları üzerinden tetiklenir:

- **`NotificationDispatchRequestedEventListener`:** Diğer modüllerden fırlatılan `NotificationDispatchRequestedEvent` olayını dinler; alıcı ID'sini, başlığı ve metadata alanlarını çözerek `createAndSend` metodunu çalıştırır.
- **`NewListingNotificationListener` (`follow` modülü):** Takip edilen bir satıcı yeni ürün yayınladığında takipçilerine bildirim gönderir.

---

## 5. İlgili Dosyalar

- Servis Uygulaması: [`NotificationService.java`](../src/main/java/com/serhat/secondhand/notification/application/NotificationService.java)
- Akış Deposu: [`NotificationFeedRepository.java`](../src/main/java/com/serhat/secondhand/notification/repository/NotificationFeedRepository.java)
- WebSocket Push Servisi: [`NotificationWebSocketService.java`](../src/main/java/com/serhat/secondhand/notification/application/NotificationWebSocketService.java)
- Şablon Kataloğu: [`NotificationTemplateCatalog.java`](../src/main/java/com/serhat/secondhand/notification/template/NotificationTemplateCatalog.java)
- REST API: [`NotificationController.java`](../src/main/java/com/serhat/secondhand/notification/api/NotificationController.java)
