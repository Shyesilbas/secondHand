---
name: Documentation Sync
description: Kod değiştiğinde artifact, README veya GEMINI.md güncellenmesi gerekiyorsa tetiklenir.
---

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`

# Documentation Sync

## Tetiklenme
Mimari (yeni paket/migration/cache), kod akışı veya iş mantığı değiştiğinde, ayrıca "dokümanı güncelle", "artifact değişti" dendiğinde tetiklenir.

## Çalışma Adımları
1. Hangi kod değişti? → Hangi doküman etkilenir?
2. **[KRİTİK ADIM]** Eğer yeni paket, yeni Flyway migration, cache davranışı veya yeni AOP aspect eklendiyse `PROJECT_REPORT.md` dosyasını MUTLAKA güncelle!
3. Sadece etkilenen bölümü güncelle, diğerine dokunma.
4. Yeni bilgiyi sadece bir yere yaz (GEMINI.md, PROJECT_REPORT.md veya ilgili README).
5. Güncelleme sonrası çelişen eski metni (stale data) sil.

## Kurallar
- Kısa tut: bir bölüm maksimum 5–8 satır.
- Tekrar etme: aynı bilgi birden fazla dokümanda kopyalanmasın.
- Asla "stale data" bırakma: Kod değiştiği an ilgili rapor da değişmelidir.
