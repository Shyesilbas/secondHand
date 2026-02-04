package com.serhat.secondhand.ai.config;

public final class AuraProductKnowledge {

    public static final String CONTENT = """
            SECONDHAND PLATFORM BİLGİSİ (Aura bu uygulamayı ezberlemiş gibi davranır):

            Ana sayfa: / — Keşfet, kampanyalar, vitrin ilanları.
            Kategoriler / Listings: /listings/prefilter — Önce kategori seçilir (Araç, Elektronik, Kitap, Giyim, Gayrimenkul, Spor), sonra tip/marka/model gibi filtrelerle liste sayfasına gidilir. Liste: /listings?category=...&... (filtre parametreleri).
            İlan detay: /listings/:id — Tek ilan; sepete ekle, teklif ver, karşılaştır, favorilere ekle, "Aura'ya sor" butonu.
            İlan oluşturma: /listings/create — Adım adım sihirbaz; kategori seçimi, alt tip (örn. Araç tipi), marka/model, fiyat, konum, medya.
            Kategoriler ve alt yapıları:
            - VEHICLE: Araç tipi (Car, Motorcycle, Bicycle, vb.), marka, model, yıl, yakıt, vites, km.
            - ELECTRONICS: Tip (Telefon, Laptop, Kulaklık, vb.), marka, model, RAM, depolama, pil sağlığı.
            - BOOKS: Kitap tipi, tür, dil, format, basım yılı, sayfa sayısı, kondisyon.
            - CLOTHING: Marka, tip, beden, renk, cinsiyet, kategori, kondisyon.
            - REAL_ESTATE: İlan tipi (satılık/kiralık), gayrimenkul tipi (daire, arsa, vb.), ısınma, sahiplik, m², oda sayısı.
            - SPORTS: Disiplin, ekipman tipi, kondisyon.

            Arama: Header’da global arama; liste sayfasında metin/listing no ile arama.
            Sepet: /cart — Eklenen ilanlar; süre sınırlı rezervasyon. Ödeme: /checkout.
            Ödemeler: /payments — İlan ücreti, vitrin ücreti; /ewallet — Bakiye.
            Teklif: İlan detayda "Teklif ver"; /offers — Tekliflerim.
            Siparişler: /profile/orders (aldıklarım), /profile/i-sold (sattıklarım).
            Favoriler: /favorites — Favori ilanlar; listeler: /lists/:id.
            Vitrin: İlanları öne çıkarma; /my-showcases.
            Takip: Satıcı takip; yeni ilan bildirimi.
            Forum: /forum — Konular, yorumlar, tepkiler.
            Şikayet: İlan veya kullanıcı şikayeti; /complaints.
            Sözleşmeler: /agreements — KVKK, kullanım koşulları; kabul zorunlu.
            Profil: /profile — Hesap, güvenlik, e-posta tercihleri.
            Bildirimler: Bildirim merkezi ve tercihleri.

            Akışlar: Göz at → Kategori/filtre seç → Liste → Detay → Sepete ekle veya teklif ver → Ödeme/onay. Satıcı: İlan oluştur → Ücret öde → Vitrin (isteğe bağlı) → Sipariş/teslimat.
            Para birimi: TRY, USD, EUR. Fiyat aralığı ve konum (şehir/ilçe) filtreleri tüm listelerde kullanılır.
            """;

    private AuraProductKnowledge() {
    }
}
