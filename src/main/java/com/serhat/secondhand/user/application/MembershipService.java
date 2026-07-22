package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.dto.MembershipStatusDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MembershipService {

    private final UserRepository userRepository;
    private final PaymentProcessor paymentProcessor;
    private final PaymentRequestFactory paymentRequestFactory;
    private final com.serhat.secondhand.core.config.AppConfigProperties appConfigProperties;

    public MembershipStatusDto getStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        return MembershipStatusDto.from(user);
    }

    public MembershipStatusDto upgradeToPremium(Long userId, com.serhat.secondhand.user.dto.MembershipUpgradeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        if (user.isPremium()) {
            throw new BusinessException("Zaten Premium üyesiniz.", HttpStatus.BAD_REQUEST, "ALREADY_PREMIUM");
        }

        BigDecimal premiumPrice = appConfigProperties.getMembership().getPremiumPrice();
        int premiumDurationDays = appConfigProperties.getMembership().getPremiumDurationDays();

        String idempotencyKey = (request.idempotencyKey() != null && !request.idempotencyKey().isBlank())
                ? request.idempotencyKey()
                : "membership-upgrade-" + userId + "-" + java.util.Objects.hash(request.verificationCode(), request.acceptedAgreementIds());
        PaymentRequest paymentRequest = paymentRequestFactory.buildMembershipPaymentRequest(user, premiumPrice, "EWALLET", idempotencyKey, request);

        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);
        if (paymentResult.isError()) {
            throw new BusinessException(paymentResult.getMessage(), HttpStatus.BAD_REQUEST, paymentResult.getErrorCode());
        }

        user.setPlan(MembershipPlan.PREMIUM);
        user.setExpirationDate(LocalDateTime.now().plusDays(premiumDurationDays));
        user.setPurchaseDate(LocalDateTime.now());
        user.setPrice(premiumPrice);
        user.setAutoRenew(true);
        user.setAiListingQuota(MembershipPlan.PREMIUM.getMonthlyAiListingQuota());
        userRepository.save(user);

        return MembershipStatusDto.from(user);
    }

    public MembershipStatusDto cancelSubscription(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        if (!user.isPremium()) {
            throw new BusinessException("Aktif bir aboneliğiniz bulunmamaktadır.", HttpStatus.BAD_REQUEST, "NO_ACTIVE_SUBSCRIPTION");
        }

        user.setAutoRenew(false);
        userRepository.save(user);

        return MembershipStatusDto.from(user);
    }

    public MembershipStatusDto toggleAutoRenew(Long userId, boolean autoRenew) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        if (!user.isPremium()) {
            throw new BusinessException("Aktif bir aboneliğiniz bulunmamaktadır.", HttpStatus.BAD_REQUEST, "NO_ACTIVE_SUBSCRIPTION");
        }

        user.setAutoRenew(autoRenew);
        userRepository.save(user);

        return MembershipStatusDto.from(user);
    }

    @Transactional
    public boolean renewPremiumMembership(User user) {
        if (!user.isAutoRenew()) {
            return false;
        }

        BigDecimal premiumPrice = appConfigProperties.getMembership().getPremiumPrice();
        int premiumDurationDays = appConfigProperties.getMembership().getPremiumDurationDays();

        String idempotencyKey = "membership-autorenew-" + user.getId() + "-" + java.time.LocalDate.now();
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(null)
                .receiverName("SYSTEM")
                .receiverSurname("MEMBERSHIP")
                .amount(premiumPrice)
                .currency("TRY")
                .providerName("EWALLET")
                .transactionType(com.serhat.secondhand.payment.entity.PaymentTransactionType.MEMBERSHIP_PAYMENT)
                .paymentDirection(com.serhat.secondhand.payment.entity.PaymentDirection.OUTGOING)
                .agreementsAccepted(true)
                .verificationCode("AUTO_RENEWAL")
                .idempotencyKey(idempotencyKey)
                .build();

        var paymentResult = paymentProcessor.executeSinglePayment(user.getId(), paymentRequest);
        if (paymentResult.isSuccess()) {
            user.setPlan(MembershipPlan.PREMIUM);
            user.setExpirationDate(user.getExpirationDate() != null ? user.getExpirationDate().plusDays(premiumDurationDays) : LocalDateTime.now().plusDays(premiumDurationDays));
            user.setPurchaseDate(LocalDateTime.now());
            user.setPrice(premiumPrice);
            user.setAutoRenew(true);
            user.setAiListingQuota(MembershipPlan.PREMIUM.getMonthlyAiListingQuota());
            userRepository.save(user);
            log.info("Kullanıcı {} Premium üyeliği otomatik yenilendi.", user.getId());
            return true;
        } else {
            user.setPlan(MembershipPlan.FREE);
            user.setAutoRenew(false);
            user.setAiListingQuota(MembershipPlan.FREE.getMonthlyAiListingQuota());
            userRepository.save(user);
            log.warn("Kullanıcı {} Premium üyeliği otomatik yenileme ödemesi başarısız oldu, FREE'ye düşürüldü. Hata: {}", user.getId(), paymentResult.getMessage());
            return false;
        }
    }
}
