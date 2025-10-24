package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ListingFeeService {

    private final UserService userService;
    private final ListingService listingService;

    @Value("${app.listing.creation.fee}")
    private BigDecimal listingCreationFee;

    @Value("${app.listing.fee.tax}")
    private BigDecimal listingFeeTax;

    @Transactional(readOnly = true)
    public PaymentRequest buildListingFeePaymentRequest(ListingFeePaymentRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Listing listing = listingService.findById(request.listingId())
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.LISTING_NOT_FOUND));

        listingService.validateOwnership(request.listingId(), user);

        BigDecimal totalFee = calculateTotalListingFee();

        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(null)
                .receiverName("System")
                .receiverSurname("Payment")
                .listingId(listing.getId())
                .amount(totalFee)
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.LISTING_CREATION)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .build();
    }

    @Transactional(readOnly = true)
    public ListingFeeConfigDto getListingFeeConfig() {
        BigDecimal totalFee = calculateTotalListingFee();
        return ListingFeeConfigDto.builder()
                .creationFee(listingCreationFee)
                .taxPercentage(listingFeeTax)
                .totalCreationFee(totalFee)
                .build();
    }

    protected BigDecimal calculateTotalListingFee() {
        BigDecimal taxAmount = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return listingCreationFee.add(taxAmount);
    }
}
