# Shipping (Kargo) Modülü

Bu modül, siparişlerin lojistik süreçlerini yönetmekten sorumludur. `order` paketinden ayrıştırılarak bağımsız bir yapı haline getirilmiştir.

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

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
