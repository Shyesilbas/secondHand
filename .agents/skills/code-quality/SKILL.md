---
name: Code Quality Control
description: Kod yazımı bittikten sonra mimari standartların (DTO, Exception, Transaction) ihlal edilip edilmediğini kontrol eder.
triggers:
  - "kodu incele"
  - "refactor et"
  - "kalite kontrol"
  - "PR hazır mı"
  - "merge öncesi"
---
> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`

# Code Quality Control

## Tetiklenme
"kodu incele", "refactor et", "kalite kontrol yap" dendiğinde veya büyük bir özellik kodu yazıldıktan hemen sonra.

## Çalışma Adımları
1. Eklenen veya değiştirilen kodları tara.
2. DTO kuralları: Controller hiçbir zaman Entity dönmemeli, her giriş/çıkış DTO olmalıdır.
3. Transaction kuralları: `payment` veya `escrow` gibi alanlarda `@Transactional` olup olmadığına bak. Rollback stratejileri eksik mi kontrol et.
4. Exception Handling: Hard-coded hata mesajları varsa, enum (`AuthErrorCodes` vs) kullanımına yönlendir.
5. Sızıntı kontrolü: Service katmanındaki iş mantığı asla Controller katmanına sızmamalıdır. Controller'lar ince (thin) kalmalıdır.

## Kurallar
- Olası ihlalleri doğrudan düzeltme, önce raporla ve onay al.
- Hataları gösterirken satır numarası ve dosya yoluyla net belirt.
- Genel Java öğütleri değil, tamamen bu projeye (SecondHand) özel mimari riskler üzerinden inceleme yap.
