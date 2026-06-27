package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MembershipScheduler {

    private final UserRepository userRepository;
    private final MembershipService membershipService;

    // Her gece 00:01'de çalışır — süresi dolan Premium'ları yenile veya FREE'ye düşür
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void downgradeExpiredPremiumUsers() {
        List<User> expired = userRepository.findExpiredPremiumUsers(LocalDateTime.now());
        expired.forEach(user -> {
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
        });
    }

    // Her ayın 1'inde AI ilan kotasını resetle
    @Scheduled(cron = "0 0 1 1 * *")
    @Transactional
    public void resetMonthlyAiQuota() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> 
            user.setAiListingQuota(user.getEffectivePlan().getMonthlyAiListingQuota())
        );
        userRepository.saveAll(users);
        log.info("Aylık AI ilan kotaları resetlendi.");
    }
}
