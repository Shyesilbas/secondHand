# ADR-0004: Payment provider'lar Strategy ve Port/Adapter ile

- **Durum:** Kabul edildi
- **Kapsam:** `payment`

## Bağlam
Provider'a göre `if-else` zinciri her yeni provider'da mevcut kodu değiştirmeyi gerektirir. Bu regression riski, SRP ihlali ve zor test anlamına gelir.

## Karar
Her provider ortak bir port (`PaymentProviderPort`) arkasında kendi sınıfında yaşar; hangisinin kullanılacağı strategy ile seçilir. Yeni provider eklemek mevcut sınıfları değiştirmez (Open/Closed).

## Sonuçlar
- Kazanç: Provider ekleme izole ve testlenebilir; adım adım prosedür [add-payment-provider runbook'unda](../../src/main/java/com/serhat/secondhand/payment/.docs/runbooks/add-payment-provider.md).
- Maliyet: Küçük bir soyutlama katmanı ve provider başına ayrı sınıf.

## Kod Referansları
[payment-strategy-and-provider-extension-guide.md](../payment-strategy-and-provider-extension-guide.md) · `PaymentProviderPort`
