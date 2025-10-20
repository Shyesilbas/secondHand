package com.serhat.secondhand.refund.scheduler;

import com.serhat.secondhand.refund.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RefundScheduler {

    private final RefundService refundService;

    /**
     * Her 10 dakikada bir pending refund taleplerini kontrol et ve işle
     * 1 saatten eski pending refund'lar otomatik olarak işlenecek
     */
    @Scheduled(fixedRate = 600000) // 10 dakika = 600,000 ms
    public void processPendingRefunds() {
        log.info("Starting scheduled refund processing task");
        try {
            int processedCount = refundService.processPendingRefunds();
            log.info("Scheduled refund processing completed. Processed {} refunds", processedCount);
        } catch (Exception e) {
            log.error("Error in scheduled refund processing", e);
        }
    }
}

