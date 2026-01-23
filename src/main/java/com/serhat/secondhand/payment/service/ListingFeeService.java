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
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ListingFeeService {

    private final ListingConfig listingConfig;
    private final UserService userService;
    private final ListingService listingService;
    private final PaymentProcessor paymentProcessor;
    private final PaymentRequestMapper paymentRequestMapper;

    @Transactional
    public Result<PaymentDto> payListingCreationFee(ListingFeePaymentRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Listing listing = listingService.findById(request.listingId())
                .orElse(null);

        if (listing == null) {
            return Result.error(PaymentErrorCodes.LISTING_NOT_FOUND);
        }

        Result<Void> ownershipResult = listingService.validateOwnership(request.listingId(), user);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        BigDecimal totalFee = calculateTotalListingFee();
        PaymentRequest paymentRequest = paymentRequestMapper.buildListingFeePaymentRequest(user, listing, request, totalFee);
        
        return paymentProcessor.process(paymentRequest, authentication);
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
        BigDecimal listingCreationFee = listingConfig.getCreation().getFee();
        BigDecimal listingFeeTax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return listingCreationFee.add(taxAmount);
    }
}
