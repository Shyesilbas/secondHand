# Pricing (Fiyatlandırma) Modülü

Bu modül, sepet ve ödeme adımlarındaki fiyat hesaplama, kampanya indirimleri ve kupon kullanımı kurallarını yöneten fiyatlandırma motorunu (Pricing Engine) barındırır.

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## Temel Yapı

### 1. Fiyat Hesaplama Motoru (`PriceCalculationEngine`)
- Sepetteki tüm ürünler için temel fiyatları, aktif kampanyaları ve uygulanan kuponları bir araya getirerek nihai fiyat kırılımını hesaplar.
- **İşlem Sırası:**
  1. Sepet alt toplamı hesaplanır.
  2. Geçerli kampanyalar (`CampaignDiscountCalculator`) filtrelenir ve sepet öğelerine indirim uygulanır.
  3. Kullanıcının girdiği kupon kodu (`CouponDiscountCalculator`) indirimli alt toplam üzerinden uygulanır.
  4. Nihai ödenecek tutar, toplam yapılan indirimler ve kupon payları belirlenir.

### 2. İndirim Hesaplayıcılar (`pricing.calculator`)
- **Kampanya Hesaplayıcı (`CampaignDiscountCalculator`):** Yüzdelik veya sabit tutarlı satıcı/ilan kampanyalarını ilan bazında uygular.
- **Kupon Hesaplayıcı (`CouponDiscountCalculator`):** Platform genelindeki aktif kuponların sepet toplamı sınırları ve geçerlilik kontrollerini yaparak indirimi uygular.

## İş Kuralları ve Sınırlamalar
- **İlan Tipi Sınırlamaları:** Gayrimenkul (`REAL_ESTATE`) ve Vasıta (`VEHICLE`) gibi yüksek bütçeli kategoriler platform genelindeki standart sepet kampanyalarından hariç tutulabilir.
- **Kupon Önceliği:** Kupon indirimleri, kampanya indirimleri uygulandıktan sonra kalan net tutar üzerinden hesaplanır.
