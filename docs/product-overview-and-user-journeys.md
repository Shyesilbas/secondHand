# Ürün Genel Bakışı ve Kullanıcı Akışları

Bu doküman platformu kullanıcının gözünden anlatır: kim ne yapabilir, bir alışveriş baştan sona nasıl ilerler, hangi güvenceler vardır. Kod ve tablo ayrıntıları ilgili deep dive'lardadır; her bölümün sonunda linki vardır.

## 1. Roller
| Rol | Yapabildikleri |
| :--- | :--- |
| Ziyaretçi | İlanları gezer, arar, filtreler, ilan ve satıcı profillerini görür |
| Kullanıcı (alıcı ve satıcı aynı hesap) | İlan açar, favorilere ekler, teklif verir, sepetle satın alır, mesajlaşır, değerlendirme yazar, şikayet eder |
| Admin | Platform kuponlarını yönetir, outbox ve moderasyon araçlarına erişir (`ROLE_ADMIN`) |

Üyelik planları `BASIC`, `PLUS` ve `PRO`'dur; plan, Aura asistanının günlük soru kotasını belirler ([auth-jwt-and-security-architecture.md](auth-jwt-and-security-architecture.md)).

## 2. Satıcı Akışı
1. **İlan açma:** kategori seçilir (araç, elektronik, emlak, kitap, giyim, spor). Form kategoriye özel kurallardan çizilir; katalogda doğrulanabilen bilgiler (ör. araç ve elektronik teknik özellikleri, kitap baskısı) sunucu tarafından doğrulanmış değerlerle doldurulur ([catalog-and-category-polymorphism.md](catalog-and-category-polymorphism.md)).
2. **Yönetim:** "İlanlarım" sayfasında ilan durumu (`ACTIVE`, `INACTIVE`, `SOLD` ...) tek tek veya toplu değiştirilir; fiyat değişiklikleri fiyat geçmişine yazılır.
3. **Görünürlük:** ücretli vitrin ile ilan öne çıkarılır; ilan sahibi görüntülenme istatistiklerini görür. Ana sayfada en çok satan ilanlar listelenir.
4. **İndirim:** satıcı kendi ilanları için kampanya oluşturur. Kampanya indirimi satıcının kazancından düşer; platform kuponları düşmez (bkz. bölüm 5).
5. **Teklifler:** gelen teklifi kabul eder, reddeder veya karşı teklif verir.
6. **Kazanç:** teslimat tamamlanınca escrow serbest kalır ve tutar satıcının e-cüzdanına (eWallet) geçer.

## 3. Alıcı Akışı
1. **Keşif:** filtreli arama, favori listeleri, karşılaştırma, satıcıyı takip etme. Aura asistanı doğal dille arama yapar ve fiyat önerir ([aura-ai-and-context-architecture.md](aura-ai-and-context-architecture.md)).
2. **Sepet ve rezervasyon:** ödeme adımına geçildiğinde ürün stoğu 15 dakika boyunca alıcıya ayrılır; süre dolarsa stok otomatik serbest kalır ([stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md)).
3. **Checkout:** adres, teslimat yöntemi, ödeme yöntemi, kupon ve doğrulama kodu adımları. Sepet birden çok satıcıdan ürün içerirse her satıcı için ayrı sipariş oluşur ([checkout-pipeline-and-distributed-transaction-flow.md](checkout-pipeline-and-distributed-transaction-flow.md)).
4. **Ödeme:** tutar hemen satıcıya gitmez, escrow'da bekler.
5. **Teslimat ve onay:** teslimat alındığında alıcı onaylar; onay gelmezse sistem 72 saat sonra siparişi tamamlar. Bu sürede para satıcıya geçmez.
6. **İade ve iptal:** teslimden sonra 48 saat içinde iade istenebilir; kargolanmamış sipariş iptal edilebilir. Kalem bazında iptal/iade yapılır ([order-lifecycle-and-compensation-management.md](order-lifecycle-and-compensation-management.md)).
7. **Değerlendirme:** tamamlanan siparişten sonra satıcı değerlendirilir.

## 4. Teslimat Yolları
- **Kargo:** satıcı kargoya verir, alıcı takip eder. Satıcı 72 saat içinde kargolamazsa sipariş sistem tarafından iptal edilir.
- **Güvenli buluşma (Safe Meetup):** yüz yüze teslimde alıcı ve satıcı OTP veya QR kodu ile teslimi doğrular. 3 hatalı denemede doğrulama 15 dakika kilitlenir; teslim doğrulanınca 24 saat içinde sipariş tamamlanır ([safe-meetup-delivery-and-verification.md](safe-meetup-delivery-and-verification.md)).

## 5. Fiyat, Kampanya ve Kuponlar
- **Satıcı kampanyası:** satıcının kendi ilanında yaptığı indirimdir ve satıcının geliri buna göre azalır.
- **Platform kuponu:** admin tanımlar (yüzde, sabit tutar, tür bazlı veya alt tutar eşikli). Kupon indirimini platform karşılar: alıcı daha az öder, satıcı kuponsuz tutarı alır. Fark escrow kaydında `platform_subsidy` olarak tutulur ve iptal/iadede alıcıya geri verilmez.
- **Limitler:** kupon kullanıcı başına ve genel olarak sınırlanabilir; "Kuponlarım" sayfası kalan hakkı, son kullanma tarihini ve bugüne kadar kuponlarla yapılan toplam tasarrufu gösterir ([pricing-coupon-and-campaign-architecture.md](pricing-coupon-and-campaign-architecture.md)).
- Emlak ve araç ilanları indirim ve kupon kapsamı dışındadır.

## 6. Pazarlık (Teklif)
Alıcı ilana fiyat teklifi verir; satıcı kabul eder, reddeder veya karşı teklif yapar. Kabul edilen teklif ilanın stoğunu ödeme süresi boyunca tutar; ödeme yapılmazsa teklif süresi dolar ve stok serbest kalır ([offer-system-and-concurrency-locks.md](offer-system-and-concurrency-locks.md)).

## 7. İletişim
Sohbet (WebSocket ile anlık), bildirimler (kişisel ve sistem duyuruları) ve uygulama içi e-postalar tek gelen kutusunda (`/inbox`) toplanır ([notification-feed-and-broadcast-architecture.md](notification-feed-and-broadcast-architecture.md), [websocket-stomp-and-chat-architecture.md](websocket-stomp-and-chat-architecture.md)).

## 8. Güven ve Güvenlik
- Oturum çerezleri `HttpOnly` olup yenileme token'ı döndürülür; ayrıntı [auth-jwt-and-security-architecture.md](auth-jwt-and-security-architecture.md).
- Para hareketi yalnızca sunucunun fiyatladığı akışlarla yapılır; ödeme öncesi sözleşme onayı ve e-posta doğrulama kodu istenir.
- Şikayetler moderasyon kuyruğuna düşer; yaptırım ve itiraz mekanizması vardır ([complaint modül hub'ı](../src/main/java/com/serhat/secondhand/complaint/README.md)).
- Kullanıcılar birbirini engelleyebilir; oran sınırlama brute-force ve kötüye kullanımı keser ([rate-limiting-and-throttling-architecture.md](rate-limiting-and-throttling-architecture.md)).

## 9. Admin ve Operasyon
Admin kuponları `/admin/coupons` sayfasından yönetir. Takılan event'ler, DLT ve stok farkı için [operations-runbook.md](operations-runbook.md) kullanılır.
