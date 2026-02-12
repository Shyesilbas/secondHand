package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.validation.ListingFeePaymentValidation;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.mapper.PaymentRequestMapper;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingFeeService {

    private final ListingConfig listingConfig;
    private final ListingFeePaymentValidation listingFeePaymentValidation;
    private final IUserService userService;
    private final IListingService listingService;
    private final PaymentProcessor paymentProcessor;
    private final PaymentRequestMapper paymentRequestMapper;

    @Transactional
    public Result<PaymentDto> payListingCreationFee(Long userId, PaymentRequest request) {
        log.info("Processing listing fee payment for userId: {} and listingId: {}", userId, request.listingId());

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode(), userResult.getMessage());
        }
        User user = userResult.getData();

        Result<Void> validationResult = listingFeePaymentValidation.validate(request, userId);
        if (validationResult.isError()) {
            return Result.error(validationResult.getErrorCode(), validationResult.getMessage());
        }

        Listing listing = listingService.findById(request.listingId()).orElse(null);
        if (listing == null) {
            return Result.error(PaymentErrorCodes.LISTING_NOT_FOUND.toString(), "Listing Not Found.");
        }

        BigDecimal totalFee = listingService.calculateTotalListingFee();
        PaymentRequest paymentRequest = paymentRequestMapper.buildListingFeePaymentRequest(user, listing, request, totalFee);

        return paymentProcessor.executeSinglePayment(user.getId(), paymentRequest);
    }

    @Transactional(readOnly = true)
    public ListingFeeConfigDto getListingFeeConfig() {
        BigDecimal totalFee = listingService.calculateTotalListingFee();
        return ListingFeeConfigDto.builder()
                .creationFee(listingConfig.getCreation().getFee())
                .taxPercentage(listingConfig.getFee().getTax())
                .totalCreationFee(totalFee)
                .build();
    }
}