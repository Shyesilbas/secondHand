# Mimari Karar Kayıtları (ADR)

Bu dizin, mevcut kodda uygulanan büyük mimari kararların **gerekçesini** tutar. Bu kayıtlar geriye dönük yazılmıştır; her biri zaten uygulanan bir kararı ve kabul edilen ödünleşimleri (*trade-off*) açıklar. Karar tarihi yerine kodda kanıtı gösterilir.

Yeni bir karar için sıradaki numarayı alın, şablonu izleyin ve bu tabloya ekleyin. Bir karar değişirse eski kaydı silmeyin; `Durum` alanını `Yerine geçildi (ADR-XXXX)` yapın.

| ADR | Karar | Durum |
| :--- | :--- | :--- |
| [0001](0001-transactional-outbox-with-polling.md) | Kafka'ya doğrudan yazmak yerine Transactional Outbox ve polling worker | Kabul edildi |
| [0002](0002-redis-lua-stock-reservation.md) | Stok rezervasyonu Redis Lua'da, kalıcı stok PostgreSQL'de | Kabul edildi |
| [0003](0003-item-level-escrow.md) | Escrow kaydı sipariş değil `OrderItem` başına tutulur | Kabul edildi |
| [0004](0004-payment-provider-port-and-strategy.md) | Payment provider'ları Strategy + Port/Adapter ile eklenir | Kabul edildi |
| [0005](0005-httponly-cookie-jwt-sessions.md) | Oturum token'ları `HttpOnly` cookie'de, refresh token hash'lenir | Kabul edildi |
| [0006](0006-immutable-flyway-migrations.md) | Flyway migration'ları değiştirilmez, `ddl-auto: validate` | Kabul edildi |

## Şablon

```markdown
# ADR-XXXX: Başlık

- **Durum:** Önerildi | Kabul edildi | Yerine geçildi (ADR-YYYY)
- **Kapsam:** etkilenen modüller

## Bağlam
Hangi problem ve hangi kısıt vardı.

## Karar
Ne seçildi, tek paragraf.

## Sonuçlar
Kazanılanlar ve kabul edilen maliyetler.

## Kod Referansları
Kararı uygulayan sınıflar ve doküman linkleri.
```
