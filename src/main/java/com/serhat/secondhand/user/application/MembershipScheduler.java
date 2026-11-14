package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class MembershipScheduler {

    private final UserRepository userRepository;
    private final MembershipService membershipService;
    private final TransactionTemplate transactionTemplate;

    public MembershipScheduler(UserRepository userRepository,
                               MembershipService membershipService,
                               PlatformTransactionManager transactionManager) {
        this.userRepository = userRepository;
        this.membershipService = membershipService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    // Her gece 00:01'de çalışır — süresi dolan Premium'ları kullanıcı başına izole transaction'da yenile veya FREE'ye düşür
    @Scheduled(cron = "0 1 0 * * *")
    @SchedulerLock(name = "membershipPremiumRenewalScheduler", lockAtMostFor = "PT30M", lockAtLeastFor = "PT1M")
    public void downgradeExpiredPremiumUsers() {
        LocalDateTime now = LocalDateTime.now();
        List<Long> expiredUserIds = userRepository.findExpiredPremiumUserIds(now);
        for (Long userId : expiredUserIds) {
            try {
                transactionTemplate.executeWithoutResult(status -> processExpiredUser(userId, now));
            } catch (RuntimeException ex) {
                log.error("Kullanıcı {} Premium yenileme/düşürme işlemi başarısız oldu, diğer kullanıcılara devam ediliyor.", userId, ex);
            }
        }
    }

    private void processExpiredUser(Long userId, LocalDateTime now) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getPlan() != MembershipPlan.PREMIUM
                || user.getExpirationDate() == null || !user.getExpirationDate().isBefore(now)) {
            return;
        }
        if (user.isAutoRenew()) {
            boolean renewed = membershipService.renewPremiumMembership(user);
            if (renewed) {
                log.info("Kullanıcı {} Premium üyeliği otomatik yenilendi.", user.getId());
            } else {
                log.info("Kullanıcı {} Premium üyeliği yenilenemedi (bakiye yetersiz vb.), FREE'ye düşürüldü.", user.getId());
            }
        } else {
            user.setPlan(MembershipPlan.FREE);
            user.setAiListingQuota(MembershipPlan.FREE.getMonthlyAiListingQuota());
            userRepository.save(user);
            log.info("Kullanıcı {} Premium süresi doldu, autoRenew kapalı olduğundan FREE'ye düşürüldü.", user.getId());
        }
    }

    // Her ayın 1'inde AI ilan kotasını tek toplu UPDATE ile resetle
    @Scheduled(cron = "0 0 1 1 * *")
    @SchedulerLock(name = "membershipAiQuotaResetScheduler", lockAtMostFor = "PT15M", lockAtLeastFor = "PT1M")
    @Transactional
    public void resetMonthlyAiQuota() {
        int updated = userRepository.resetMonthlyAiListingQuotas(
                LocalDateTime.now(),
                MembershipPlan.PREMIUM.getMonthlyAiListingQuota(),
                MembershipPlan.FREE.getMonthlyAiListingQuota());
        log.info("Aylık AI ilan kotaları tek sorguda resetlendi. Güncellenen kullanıcı sayısı: {}", updated);
    }
}
