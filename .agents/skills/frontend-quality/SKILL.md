---
name: Frontend Quality Control
description: Frontend kod yazımı veya mimari incelemesi sırasında React standartlarına uyumu denetler.
triggers:
  - "frontend refactor"
  - "react inceleme"
  - "ui kodu yaz"
  - "hook düzenle"
---

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`

# Frontend Quality Control

## Tetiklenme
Frontend (.jsx, .js) kodlarında geliştirme yapıldığında, refactor istendiğinde veya API entegrasyonu yazılırken devreye girer.

## Kurallar

### 1. Veri Çekme (Data Fetching)
- **YASAK:** Komponent içinde `useEffect` kullanarak `fetch` veya `axios` ile doğrudan veri çekmeyin.
- **ZORUNLU:** Tüm data fetching ve caching işlemleri için `react-query` (`useQuery`, `useMutation`) hook'larını kullanın.
- **NEDEN:** React Query loading state, caching ve staleTime yönetimini otomatik yapar, useEffect spagettisini önler.

### 2. Manuel Cache Yönetimi (localStorage)
- **YASAK:** Global veri (örn. enumlar) için `localStorage.setItem` ve `JSON.parse` ile manuel cache yönetimi (enumCache.js gibi) yapmayın.
- **ZORUNLU:** Kalıcı cache gerektiren statik veriler için `react-query` `staleTime: 24 * 60 * 60 * 1000` (veya Infinity) özelliğini kullanın. 

### 3. State ve Lifecycle (useEffect Zincirleri)
- **YASAK:** Birbirini tetikleyen (cascading) `useEffect` zincirleri kurmayın (A tetiklenir B'yi değiştirir, B tetiklenir C'yi değiştirir).
- **ZORUNLU:** Derived state (türetilmiş durum) için `useMemo` kullanın. Çoklu state değişimlerini `useReducer` veya tek bir olay işleyicisinde (event handler) toplayın.

### 4. WebSocket ve Event Cleanup
- **YASAK:** WebSocket (STOMP) veya global event listener başlatıp `cleanup` işlemini (return) unutmak.
- **ZORUNLU:** `useEffect` içinde `client.activate()` / `connect()` yapılıyorsa mutlaka `return () => client.deactivate()` (veya disconnect) yapılmalıdır. Sadece `.connected` kontrolü yetmez, askıda (connecting) kalan bağlantılar da temizlenmelidir.

### 5. UI Standartları
- Bileşenleri modüler (tek sorumluluk) tutun. 500+ satırlık devasa formlar yerine alt bileşenlere (sub-components) bölün.
- Stil için Tailwind kullanılıyorsa class karmaşasını azaltmak için anlamlı isimlendirmelere veya config sabitlerine başvurun.

### 6. Liste ve Key Kullanımı
- **YASAK:** `map()` içinde döngü oluştururken `key` olarak array index (`index`) kullanmak.
- **ZORUNLU:** Her zaman verinin benzersiz ve stabil bir alanını (örn. `id`, `uuid` vb.) veya uygun yoksa statik + index kombinasyonunu `key` olarak kullanın.
