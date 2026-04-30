# Shipping (Kargo) Modülü

Bu modül, siparişlerin lojistik süreçlerini yönetmekten sorumludur. `order` paketinden ayrıştırılarak bağımsız bir yapı haline getirilmiştir.

## Özellikler

- **Zengin Domain Modeli (Rich Domain Model):** Kargo durum geçişleri, takip URL'i oluşturma ve tahmini teslimat tarihi hesaplama gibi iş mantıkları doğrudan `Shipping` entity'si içindedir.
- **Kargo Firması Stratejisi:** `Carrier` enum yapısı sayesinde yeni kargo firmaları eklemek oldukça kolaydır (Aras, Yurtiçi, MNG vb.).
- **Tahmini Teslimat:** Kargo verildiği andan itibaren otomatik olarak (varsayılan 3 gün) tahmini teslimat tarihi hesaplanır.
- **Dinamik Takip Linkleri:** Kargo firmasına ve takip numarasına göre otomatik takip URL'leri oluşturulur.

## Kullanım

### Siparişi Kargoya Verme (Satıcı)
Satıcılar `PUT /api/v1/orders/{orderId}/ship` endpoint'ini kullanarak kargo bilgilerini girebilir:

```json
{
  "carrier": "ARAS",
  "trackingNumber": "123456789"
}
```

### Kargo Durumları
- `PENDING`: Kargo bilgileri henüz girilmedi (Ödeme sonrası varsayılan).
- `IN_TRANSIT`: Kargo verildi, yolda.
- `DELIVERED`: Kargo başarıyla teslim edildi.
- `CANCELLED`: Kargo iptal edildi.

## Mimari Kararlar
- **Modülerlik:** Kargo mantığı siparişten ayrılarak SOLID prensiplerine (Single Responsibility) uygun hale getirilmiştir.
- **Genişletilebilirlik:** `Carrier` enum'ı içindeki `trackingUrlBase` alanı sayesinde OCP (Open/Closed Principle) korunmuştur.
