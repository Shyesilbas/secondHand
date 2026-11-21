# ADR-0001: Transactional Outbox ve polling worker

- **Durum:** Kabul edildi
- **Kapsam:** `payment`, `order`, `escrow`, `core/outbox`

## Bağlam
Ödeme tamamlandığında stok düşümü, satıcı cüzdanı ve e-posta gibi yan etkilerin Kafka üzerinden tetiklenmesi gerekir. Servis içinde DB commit'i ve Kafka yazımı ayrı ayrı yapılırsa **dual-write** riski doğar: DB commit olur ama Kafka çökerse event kaybolur (para satıcıya ulaşmaz); tersi durumda mükerrer işlem olur.

## Karar
Event, ana kayıtla **aynı transaction'da** `*_outbox_events` tablosuna yazılır. `@Scheduled` worker'lar (`PaymentOutboxWorker`, `EscrowOutboxWorker`, `OrderOutboxWorker`) `PENDING` kayıtları okuyup Kafka'ya at-least-once gönderir. CDC (Debezium) yerine polling seçilmiştir; çünkü CDC, Kafka Connect gibi ek bir bileşen ister ve mevcut yük `@Scheduled` worker'larla karşılanır.

## Sonuçlar
- Kazanç: DB ile mesaj akışı arasında kayıp yok; broker kapalıyken event'ler tabloda bekler.
- Maliyet: Teslimat **at-least-once**tır, bu yüzden her consumer idempotent olmak zorundadır (`processed_kafka_events`).
- Maliyet: Gecikme polling aralığına bağlıdır (varsayılan 5 sn).
- Maliyet: Deneme hakkı bitince kayıt `FAILED` kalır ve otomatik yeniden denenmez. Görünürlük için `secondhand_outbox_events` gauge'u, müdahale için admin requeue endpoint'i vardır ([operasyon runbook'u](../operations-runbook.md)).
- Maliyet: `processed_kafka_events` kayıtları da outbox ile aynı retention'la temizlendiği için bu süreden eski bir mesaj yeniden teslim edilirse tekrar işlenir.

## Kod Referansları
[redis-and-kafka-architecture.md](../redis-and-kafka-architecture.md) · [escrow-lifecycle-and-state-machine.md](../escrow-lifecycle-and-state-machine.md) · `OutboxHousekeepingScheduler` · `ProcessedKafkaEventRepository`
