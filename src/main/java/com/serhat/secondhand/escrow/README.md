# Escrow Servisi Teknik Rehber

Bu dokumanin amaci:
- `escrow` paketindeki para blokaj ve cozum akislarini netlestirmek
- Odeme sistemiyle olan entegrasyon modelini (Unified Payment Record) tanimlamak
- Alim-satim guvenligi icin uygulanan kritik is kurallarini belgelemek

## 1) Paketin Amaci ve Sinirlari

`escrow` paketi, guvenli odeme (guvenli ticaret) akisini yonetir. Parayi alicidan tahsil edildigi anda sistemde bloke eder ve teslimat onayina kadar satici bakiyesine aktarmaz.

Kapsam:
- Para blokaj kayitlarinin yonetimi (`Escrow` entity)
- Blokaj baslatma (`hold`)
- Saticiya aktarim (`release`)
- Iptal ve iade surecleri (`cancel`, `refund`)
- Odeme kayitlariyla senkronizasyon

Kapsam disi:
- Kredi karti veya banka entegrasyonu (bu `payment` paketindedir)
- Siparis lojistik takibi (bu `order` paketindedir)

## 2) Paket Yapisi

- `application/*`
  - `EscrowService`: Ana is mantigi ve koordinasyon.
- `domain/entity/*`
  - `Escrow`: Blokaj detaylarini tutan ana entity.
- `domain/repository/*`
  - `EscrowRepository`: Veritabani erisim katmani.

## 3) Entegrasyon Modeli: Unified Payment Record

Escrow sistemi, `payment` sistemiyle **ayni odeme kayitlarini** paylasir:

1. **Blokaj (Hold):** Siparis verildiginde `PaymentProcessor` tarafindan `status=ESCROW` olan bir odeme kaydi olusturulur. Escrow servisi bu kayit uzerinden blokaj takibi yapar, yeni bir odeme kaydi olusturmaz.
2. **Cozum (Release):** Urun teslim edildiginde, Escrow servisi mevcut odeme kaydini `status=COMPLETED` olarak gunceller.
3. **Iade (Refund/Cancel):** Islem iptal edildiginde mevcut kayit `status=CANCELLED` veya `REFUNDED` olarak isaretlenir.

Bu model sayesinde:
- Veritabani siskinligi onlenir.
- Alici ve satici ayni islem uzerinden (gerekli yetkiyle) durumu takip edebilir.
- Istatistikler tutarli kalir.

## 4) Ana Is Akislari

### 4.1 Hold (Bloke Etme)
- Siparis olusturuldugunda calisir.
- Her siparis kalemi (`OrderItem`) icin bir `Escrow` kaydi acilir.
- Para saticinin bekleyen bakiyesinde (`escrowAmount`) gorunur hale gelir.

### 4.2 Release (Saticiya Aktarim)
- Alici onayinda veya sistem otomatik onayinda calisir.
- `Escrow` durumu `COMPLETED` olur.
- Iliskili `Payment` kaydi `COMPLETED` yapilir.
- Saticinin cüzdanina bakiye "sessizce" (`creditWalletQuietly`) aktarilir (tekrar odeme kaydi olusmamasi icin).
- `PaymentCompletedEvent` yayinlanarak saticiya bildirim gonderilir.

### 4.3 Cancel & Refund
- Siparis iptalinde veya iadesinde calisir.
- Para alicinin cüzdanina iade edilir (`ITEM_PURCHASE` -> `REFUND`).
- Saticinin bekleyen bakiyesinden dusulur.
- Eger para saticiya coktan aktarilmissa, satici bakiyesinden debit edilir.

## 5) Kritik Is Kurallari

- **Idempotency:** Escrow islemleri siparis bazli idempotency kurallarina tabidir.
- **Event-Driven:** Tum durum degisiklikleri event yayinlar. Boylece bildirimler ve istatistik guncellemeleri asenkron/ayrik yonetilir.
- **Cache Integrity:** Escrow islemleri sonrasi `paymentStats` onbellegi temizlenir, kullanici anlik guncel veriyi gorur.
- **User-Relative Stats:** Alici parayi "giden" (`OUTGOING`), satici ise "emanette" (`ESCROW`) olarak gorur.

## 6) Bir Degisiklik Yapacaginda Ne Yapacaksin?

1. Blokaj mantigini degistireceksen `EscrowService.hold` metoduna odaklan.
2. Odeme kaydiyla iliskiyi degistireceksen `paymentRepository` kullanimlarini incele.
3. Bildirim ekleyeceksen yeni bir handler yazmak yerine mevcut `PaymentCompletedEvent` uzerinden ilerle.
