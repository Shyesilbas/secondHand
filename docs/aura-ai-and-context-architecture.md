# Aura AI Asistanı, Context Adapter ve Bellek Mimarisi

Bu doküman, **secondHand** platformunun yapay zeka asistanı olan **Aura**'nın çok katmanlı mimarisini, Google Gemini LLM entegrasyonunu, dinamik bağlam adaptörlerini (`AgentContextAdapter`), otonom arama planlamasını (`AuraListingSearchOrchestrator`), kullanıcı uzun vadeli belleğini (`MemoryService`) ve güvenlik sınırlarını detaylandırmaktadır.

---

## 1. Mimari Genel Bakış

Aura, kullanıcının platform içi niyetini analiz ederek yalnızca statik metin üretmekle kalmaz; kullanıcının geçmiş siparişlerini, odaklandığı ilanı, sepetini, okunmamış bildirimlerini ve kişisel tercihlerini bağlama enjekte eden ve gerektiğinde pazar yerinde canlı filtreli arama yürüten otonom bir asistandır.

```
[İstemci / Web UI] ──(POST /api/v1/ai/agents/query)──► [AgentController]
                                                               │
     ┌─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┐
     ▼                                                         ▼                                                         ▼
[AgentQueryService]                                [AuraListingSearchOrchestrator]                             [MemoryService]
  ├── OrderAgentContextAdapter                       ├── BYPASS Kontrolü (Selamlaşma Filtresi)                   ├── ChatMessageRepository
  ├── ListingAgentContextAdapter                     ├── AuraAgentSearchRateLimiter (Kullanıcı Başı Limit)       └── UserMemoryRepository
  ├── ListingFocusAgentContextAdapter                ├── GeminiClient (SearchPlan Üretimi)                           ├── Bütçe, Konum, İlgi
  └── NotificationAgentContextAdapter                ├── ListingSearchService (DB Filtreleme)                        └── Asenkron Çıkarım (@Async)
     │                                                         │                                                         │
     └─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┘
                                                               │
                                                               ▼
                                                      [AgentPromptBuilder]
                                                               │ (System Instructions + Product Knowledge + Data Sources)
                                                               ▼
                                                     [GeminiAiService]
                                                               │ (Gemini 2.0 / 3.1 Flash-Lite)
                                                               ▼
                                                      [AgentQueryResponse]
                                                      (Cevap + Kaynaklar + Önerilen İlan DTO Listesi)
```

---

## 2. Bileşenler ve Görev Dağılımı

### A. Giriş Noktası: [`AgentController.java`](../src/main/java/com/serhat/secondhand/ai/agent/api/AgentController.java)
- **Endpoint:** `POST /api/v1/ai/agents/query`
- **Girdi:** `AgentQueryRequest` (`message`, `context`, `uiContext`: `currentRoute`, `listingId`, `categoryId`, `searchQuery`).
- **İşleyiş:**
  1. `AgentQueryService.buildContext()` ile aktif kullanıcının domain bağlamını ve bellek profilini toplar.
  2. `AuraListingSearchOrchestrator.augment()` ile kullanıcının mesajı bir arama niyeti içeriyorsa katalog sorgusu çalıştırır.
  3. Veri kaynakları durumunu (`AgentDataSourceDto`) derler.
  4. `GeminiAiService.askAgentQuestion()` ile nihai yanıtı üretip `AgentQueryResponse` formatında döner.

---

### B. Dinamik Bağlam Katmanı: [`AgentQueryService.java`](../src/main/java/com/serhat/secondhand/ai/agent/query/AgentQueryService.java) & [`AgentContextAdapter.java`](../src/main/java/com/serhat/secondhand/ai/agent/query/AgentContextAdapter.java)

Her bağlam adaptörü, kullanıcının o anki arayüz durumuna göre (`uiContext`) izole veri çeker:

| Adaptör Sınıfı | Kaynak Domain | Tetiklenme Şartı / Görevi |
| :--- | :--- | :--- |
| **`ListingFocusAgentContextAdapter`** | `listing` | `uiContext.listingId` mevcutsa aktif ilanın başlık, fiyat, kategori, açıklama ve durumunu bağlama ekler. |
| **`ListingAgentContextAdapter`** | `listing` | Kullanıcının aktif ilanlarını veya favori özetlerini bağlama ekler. |
| **`OrderAgentContextAdapter`** | `order` | Kullanıcının son siparişlerini, kargo takip durumlarını ve teslimat aşamalarını ekler. |
| **`NotificationAgentContextAdapter`** | `notification` | Okunmamış sistem bildirimlerini ve önemli işlem uyarılarını ekler. |

Bu sayede kullanıcı "Siparişim nerede?" veya "Bu ürünün kargosu ne kadar?" diye sorduğunda model halüsinasyon görmeden doğrudan doğrulanmış veritabanı verisiyle yanıt verir.

---

### C. Otonom Arama Orkestrasyonu: [`AuraListingSearchOrchestrator.java`](../src/main/java/com/serhat/secondhand/ai/agent/search/AuraListingSearchOrchestrator.java)

Kullanıcı "Bana 5000 TL altı temiz iPhone bul" dediğinde, sistem LLM'e doğrudan tüm veritabanını göndermek yerine iki aşamalı bir arama planı işletir:

1. **Bypass Denetimi (`BYPASS_SEARCH_INTENT`):**
   - Basit selamlaşma, teşekkür veya yardım ifadeleri (`merhaba`, `selam`, `nasılsın`, `teşekkürler`) tespit edildiğinde arama adımı doğrudan atlanır; LLM token maliyeti ve gecikme sıfırlanır.
2. **Hız Sınırlaması (`AuraAgentSearchRateLimiter`):**
   - Kullanıcı başına arama planı istekleri sınırlandırılır. Kota aşıldığında sistem arama adımını pas geçer.
3. **Arama Planı Çıkarımı (`SearchPlan`):**
   - Gemini'ye yapılandırılmış JSON çıktısı üreten bir sistem istemi gönderilir. Çıkarılan modlar:
     - `KEYWORD_ONLY`: Metin bazlı arama.
     - `STRUCTURED_ONLY`: Sadece kategori, fiyat aralığı, il/ilçe filtreleri.
     - `HYBRID`: Hem metin hem filtrelerin birleşimi.
     - `CATEGORY_BROWSE`: Belirli bir kategori ağacında gezinme.
     - `NO_SEARCH`: Arama gerektirmeyen bilgi soruları.
4. **Veritabanı Yürütme (`ListingSearchService`):**
   - Çıkarılan kriterler JPA Specification / Criteria sorgusuna dönüştürülür ve en uygun ilanlar (`List<SuggestedListingDto>`) seçilerek LLM istemine bağlam olarak verilir.

---

### D. Kullanıcı Uzun Vadeli Belleği: [`MemoryService.java`](../src/main/java/com/serhat/secondhand/ai/memory/service/MemoryService.java)

Aura, kullanıcılar ile yapılan sohbetleri oturumlar arasında unutmamak için çift katmanlı bellek mekanizması kullanır:

1. **Kural Tabanlı Anlık Çıkarım (Regex Patterns):**
   - Kullanıcının adı (`adım Serhat`), bütçesi (`bütçem 10000 TL`), ilgilendiği kategoriler veya iletişim tonu tercihleri (`resmi`, `samimi`) regex kalıplarıyla anında yakalanır.
2. **Asenkron LLM Bellek Çıkarımı (`@Async`):**
   - Her `N` mesajda bir (`MEMORY_UPDATE_EVERY_N_USER_MESSAGES = 3`) arka plan iş parçacığı tetiklenir.
   - Son konuşma geçmişi analiz edilerek `UserMemory` tablosundaki profil güncellenir (`SecondHandProfileDto`).
   - Bu işlem ana istek-yanıt döngüsünü bloklamaz.

---

## 3. Sistem Yönergeleri ve Bilgi Güvenliği

- **Sistem İstemleri:** [`AuraSystemInstructions.java`](../src/main/java/com/serhat/secondhand/ai/config/AuraSystemInstructions.java) asistanın rolünü, üslubunu ve etik sınırlarını belirler.
- **Platform Bilgisi:** [`AuraProductKnowledge.java`](../src/main/java/com/serhat/secondhand/ai/config/AuraProductKnowledge.java) Escrow güvencesi, kargo süreçleri ve komisyon politikası gibi ikinci el platform kurallarını modele enjekte eder.
- **İzolasyon Garantisi:** Kullanıcı verileri (şifreler, kart bilgileri, kişisel adres detayları) istem oluşturulurken filtrelenir; hiçbir adaptör güvenlik açısından hassas veriyi LLM bağlamına iletmez.

---

## 4. İlgili Dosyalar

- Controller: [`AgentController.java`](../src/main/java/com/serhat/secondhand/ai/agent/api/AgentController.java)
- Arama Orkestratörü: [`AuraListingSearchOrchestrator.java`](../src/main/java/com/serhat/secondhand/ai/agent/search/AuraListingSearchOrchestrator.java)
- Bağlam Servisi: [`AgentQueryService.java`](../src/main/java/com/serhat/secondhand/ai/agent/query/AgentQueryService.java)
- Bellek Servisi: [`MemoryService.java`](../src/main/java/com/serhat/secondhand/ai/memory/service/MemoryService.java)
- İstem Oluşturucu: [`AgentPromptBuilder.java`](../src/main/java/com/serhat/secondhand/ai/agent/prompt/AgentPromptBuilder.java)
