---
name: API Contract
description: Yeni bir özellik eklenirken backend endpoint ile frontend servis katmanı arasındaki kontratı kurar. "Yeni endpoint", "API ekle", "servis yaz", "özellik ekle", "feature" gibi ifadelerle tetiklenir.
triggers:
  - "yeni endpoint"
  - "API ekle"
  - "özellik ekle"
  - "feature ekle"
  - "servis yaz"
  - "controller ekle"
  - "hook yaz"
---

# API Contract

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`
> Backend kuralları: `.agents/skills/code-quality-control/SKILL.md`
> Frontend kuralları: `.agents/skills/frontend-quality/SKILL.md`
> Tasarım kuralları: `.agents/skills/design-system/SKILL.md`

## Tetiklenme
Yeni bir backend endpoint veya frontend özelliği eklenirken her iki tarafın kontratını birlikte kur.
Domain ismi verilmezse sor: "Hangi domain'e özellik ekliyoruz?"

## Çalışma Adımları

### 1. Domain'i Belirle
Hangi pakete ait? Şu listeye bak:
auth, listing, order, payment, escrow, ewallet,

cart, offer, review, chat, ai, campaign, showcase,

forum, complaint, notification, user, shipping

O domain'in README'sini oku. Mevcut endpoint pattern'ini anla.

### 2. Backend Kontratı Tanımla

Yeni endpoint için şablonu doldur:
HTTP Method : GET / POST / PUT / DELETE / PATCH

Path        : /api/v1/[domain]/[kaynak]

Auth        : Required / Public

Request Body: [DTO adı ve alanları]

Response    : [DTO adı ve alanları]

Hata Kodları: [HATA_KODU → açıklama]

### 3. Backend Implementasyon Sırası

Şu sırayı bozma:

Request/Response DTO yaz
Repository metodu ekle (gerekiyorsa)
Validator/Policy kuralını yaz (gerekiyorsa)
Service metodunu yaz
Controller'a endpoint ekle → ResultResponses ile wrap et


#### Controller Standardı
```java
@GetMapping("/{id}")
public ResponseEntity<?> getItem(@PathVariable Long id) {
    return ResultResponses.ok(Result.success(service.getItem(id)));
}

@PostMapping
public ResponseEntity<?> createItem(@Valid @RequestBody ItemRequest request) {
    return ResultResponses.created(Result.success(service.create(request)));
}

@DeleteMapping("/{id}")
public ResponseEntity<?> deleteItem(@PathVariable Long id) {
    return ResultResponses.noContent(service.delete(id));
}
```

#### Response Format
```json
// Başarı — direkt DTO gelir, wrapper yok:
{ "id": 1, "name": "..." }

// Hata — her zaman bu format:
{ "error": "HATA_KODU", "message": "Açıklama" }
```

#### Hata Kodu Standardı
- Büyük harf + underscore: `USER_NOT_FOUND`, `INSUFFICIENT_BALANCE`
- Domain prefix: `LISTING_NOT_FOUND`, `ORDER_CANCELLED`
- Global exception handler'a yeni exception ekle

### 4. Frontend Implementasyon Sırası

API servis fonksiyonu yaz
React Query hook'u yaz
Component'te hook'u kullan


#### API Servis Standardı
```javascript
// src/[domain]/services/[domain]Api.js
export const fetchItem = async (id) => {
  const response = await apiClient.get(`/[domain]/${id}`);
  return response.data; // direkt DTO — wrapper yok
};

export const createItem = async (data) => {
  const response = await apiClient.post('/[domain]', data);
  return response.data;
};
```

#### React Query Hook Standardı
```javascript
// src/[domain]/hooks/use[Domain].js
export const use[Domain] = (id) => {
  return useQuery({
    queryKey: ['[domain]', id],
    queryFn: () => fetch[Domain](id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreate[Domain] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: create[Domain],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[domain]'] });
    },
    onError: (error) => {
      const errorCode = error.response?.data?.error;
      const message = error.response?.data?.message;
      // toast veya error state'e yaz
    },
  });
};
```

#### Hata Yakalama Standardı
```javascript
// Hata response: { error: "KOD", message: "Açıklama" }
const errorCode = error.response?.data?.error;
const errorMessage = error.response?.data?.message;
```

### 5. Cache Etkisini Değerlendir

Yeni endpoint veri değiştiriyorsa:

**Backend:**
- İlgili `@CacheEvict` tetiklendi mi?
- Redis key invalidation gerekiyor mu?

**Frontend:**
- `queryClient.invalidateQueries` doğru key ile çağrıldı mı?
- Optimistic update gerekiyor mu?

### 6. Güvenlik Kontrolü

- [ ] Endpoint auth gerektiriyor mu? `@PreAuthorize` var mı?
- [ ] Rate limit scope'una dahil mi?
- [ ] Kullanıcı başkasının datasına erişebilir mi? (ownership kontrolü)
- [ ] Hassas veri response'a sızıyor mu?

## Kontrol Listesi

### Backend
- [ ] DTO kullanıldı, entity dönülmedi
- [ ] `ResultResponses` ile wrap edildi
- [ ] Hata kodu tanımlı ve Global Exception Handler'a eklendi
- [ ] Validator/Policy domain kuralını kapsıyor
- [ ] `@Transactional` sadece yazma işlemlerinde
- [ ] Cache invalidation tetiklendi (gerekiyorsa)

### Frontend
- [ ] `useEffect` ile fetch yok — React Query kullanıldı
- [ ] `response.data` direkt kullanıldı (double unwrap yok)
- [ ] `isLoading` ve `isError` guard'ları var
- [ ] Hata mesajı `error.response?.data?.message` ile alınıyor
- [ ] `queryClient.invalidateQueries` mutation sonrası çağrıldı

## Çıktı Formatı
Her yeni özellik için önce kontratı yaz, sonra implementasyona geç:
1. Kontrat tablosu (endpoint, request, response, hata kodları)
2. Backend implementasyon (sırayla)
3. Frontend implementasyon (sırayla)
4. Cache etkisi
5. Güvenlik kontrolü
