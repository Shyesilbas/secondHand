package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.dto.MembershipStatusDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipService {

    private static final BigDecimal PREMIUM_PRICE = new BigDecimal("100.00");
    private static final int PREMIUM_DURATION_DAYS = 30;

    private final UserRepository userRepository;
    private final PaymentProcessor paymentProcessor;
    private final PaymentRequestFactory paymentRequestFactory;

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

        String idempotencyKey = "membership-upgrade-" + userId + "-" + System.currentTimeMillis();
        PaymentRequest paymentRequest = paymentRequestFactory.buildMembershipPaymentRequest(user, PREMIUM_PRICE, PaymentType.EWALLET, idempotencyKey, request);

        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);
        if (paymentResult.isError()) {
            throw new BusinessException(paymentResult.getMessage(), HttpStatus.BAD_REQUEST, paymentResult.getErrorCode());
        }

        user.setPlan(MembershipPlan.PREMIUM);
        user.setPlanExpiry(LocalDateTime.now().plusDays(PREMIUM_DURATION_DAYS));
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
}
