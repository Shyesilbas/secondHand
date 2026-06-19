# Rules

## Genel
- Var olan mimariyi bozma.
- Gereksiz refactor yapma.
- Bir degisiklik tek sorunu cozsun.
- Kod degisirse ilgili artefact da degissin.

## Proje Kurallari
- Backend is akisi genelde `controller -> service -> validator -> repository -> mapper` seklinde ilerler.
- DTO, entity, mapper ve repository birbiriyle tutarli kalmali.
- Cache davranisi degisiyorsa etkiledigi tum katmanlar kontrol edilmeli.
- Payment, escrow, order, cart, listing gibi kritik domainlerde kural ihlali yaratacak varsayim yapma.

## Token / Baglam Kurallari
- Ilgili modul disinda arama yapma.
- Uzun dosya yerine kisa ozet dosyasini kullan.
- Bir sorunu cozerken once hedef dosyayi bul, sonra minimum diff uygula.
- Ayni bilginin kopyasini README, artifact ve prompt icinde tekrar etme.

## Best Practice
- Yorum yerine isimlendirme ve yapisal ayrim kullan.
- Degisiklik oncesi ilgili test/validation etkisini zihinde haritala.
- Riskli alanlarda fallback yerine net hata uret.
- Kural eklerken once mevcut desenle eslestir, yeni desen sadece zorunluysa ekle.
