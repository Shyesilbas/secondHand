package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.mapper.PaymentRequestMapper;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingFeeService {

    private final ListingConfig listingConfig;
    private final UserService userService;
    private final ListingService listingService;
    private final PaymentProcessor paymentProcessor;
    private final PaymentRequestMapper paymentRequestMapper;

    @Transactional
    public Result<PaymentDto> payListingCreationFee(Long userId, ListingFeePaymentRequest request) {
        log.info("Processing listing fee payment for userId: {} and listingId: {}", userId, request.listingId());

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode(), userResult.getMessage());
        }
        User user = userResult.getData();

        Listing listing = listingService.findById(request.listingId()).orElse(null);
        if (listing == null) {
            return Result.error(PaymentErrorCodes.LISTING_NOT_FOUND.toString(), "Listing Not Found.");
        }

        Result<Void> ownershipResult = listingService.validateOwnership(request.listingId(), userId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getErrorCode(), ownershipResult.getMessage());
        }

        BigDecimal totalFee = calculateTotalListingFee();
        PaymentRequest paymentRequest = paymentRequestMapper.buildListingFeePaymentRequest(user, listing, request, totalFee);

        return paymentProcessor.executeSinglePayment(user.getId(), paymentRequest);
    }

    @Transactional(readOnly = true)
    public ListingFeeConfigDto getListingFeeConfig() {
        BigDecimal totalFee = calculateTotalListingFee();
        return ListingFeeConfigDto.builder()
                .creationFee(listingConfig.getCreation().getFee())
                .taxPercentage(listingConfig.getFee().getTax())
                .totalCreationFee(totalFee)
                .build();
    }

    protected BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return fee.add(taxAmount);
    }
}