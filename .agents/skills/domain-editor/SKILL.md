---
name: Domain Editor
description: Business rule, validasyon veya servis mantığı değişiyorsa tetiklenir.
---

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`

# Domain Editor

## Tetiklenme
"bu kuralı değiştir", "validasyon ekle", "fiyat hesapla", "servis mantığı" gibi ifadeler.

## Çalışma Adımları
1. Hangi domain? (payment / order / listing / escrow / cart / offer ...)
2. O modülün README'sini oku.
3. Etkilenen zinciri belirle: validator → service → repository
4. Sadece o zincire dokun, dışına çıkma.
5. DTO ve mapper tutarlılığını kontrol et.

## Kurallar
- Payment, escrow, order'da varsayım yapma — net hata üret, fallback yazma.
- Business rule service/validator'da kalır, controller'a taşıma.
- Bir değişiklik tek sorunu çözsün.
