# Behaviour

## Amaç
SecondHand icin AI araci projeyi minimum baglamla dogru sekilde anlayabilsin.

## Temel Alanlar
- Backend: Spring Boot 3.5, Java 17, PostgreSQL, Redis, Flyway, Security, JPA, WebSocket
- Frontend: React 19, Vite, feature-based module yapisi
- Domain: listing, order, payment, escrow, ewallet, cart, offer, review, shipping, auth, campaign, showcase, favorite

## Degisiklik Prensipleri
- Mevcut moduller arasi soyutlamayi bozma.
- Ayni is kuralini birden fazla yerde tekrar etme.
- Yeni ozellikte once domain dokumanini, sonra kodu guncelle.
- Controller, service, validator, repository, mapper sirasi korunursa oncelik onu izle.
- Hardcoded mesaj ve sayilari azalt; gerekiyorsa sabit/konfig olarak merkezi tut.

## AI Calisma Kurali
- Once ilgili modul README'sini oku.
- Read order: root README -> `.artifacts/behaviour.md` -> ilgili modul README -> kaynak kod.
- Sonra sadece gerekli dosyalari degistir.
- Baglami kucuk tutmak icin gereksiz dosya taramasindan kac.
- Buyuk degisiklikleri kucuk, dogrulanabilir adimlara bol.

## Token Azaltma Kurallari
- Tekrarlanan bilgiyi yeni dosyalara yazma.
- Ozeti davranis dosyalarinda tut, detaylari kod icinde dagitma.
- Karar veremediginde tum depoyu tarama; modul bazli arama yap.
- Uzun response yerine madde madde ilerle.
- Mevcut standart isimleri kullan, yeni terim uretme.
- Guvenli degisiklikte tek kaynak olarak source code'u kabul et; README destekleyicidir.

## Best Practice Kisa Ozeti
- Boundary'leri koru.
- Domain rule'u service/validator tarafinda tut.
- Repository'yi saf data access olarak kullan.
- DTO ile entity'yi karistirma.
- Cache, event ve async yan etkileri ayrik dusun.
