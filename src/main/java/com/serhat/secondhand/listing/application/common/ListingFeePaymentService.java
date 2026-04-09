package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.port.ListingFeePaymentPort;
import com.serhat.secondhand.listing.domain.dto.request.listing.ListingFeePaymentRequest;
import com.serhat.secondhand.listing.validation.common.ListingFeePaymentValidation;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingFeePaymentService {

    private final ListingConfig listingConfig;
    private final ListingFeePaymentValidation listingFeePaymentValidation;
    private final ListingCommandService listingCommandService;
    private final ListingFeePaymentPort listingFeePaymentPort;

    @Transactional
    public Result<UUID> payListingCreationFee(Long userId, ListingFeePaymentRequest request) {
        log.info("Processing listing fee payment for userId: {} and listingId: {}", userId, request.listingId());

        Result<Void> validationResult = listingFeePaymentValidation.validate(request, userId);
        if (validationResult.isError()) {
            return Result.error(validationResult.getErrorCode(), validationResult.getMessage());
        }

        BigDecimal totalFee = listingCommandService.calculateTotalListingFee();
        ListingFeePaymentRequest enrichedRequest = enrichWithTotalFee(request, userId, totalFee);

        return listingFeePaymentPort.processListingFee(enrichedRequest);
    }

    @Transactional(readOnly = true)
    public ListingFeeConfigDto getListingFeeConfig() {
        BigDecimal totalFee = listingCommandService.calculateTotalListingFee();
        return ListingFeeConfigDto.builder()
                .creationFee(listingConfig.getCreation().getFee())
                .taxPercentage(listingConfig.getFee().getTax())
                .totalCreationFee(totalFee)
                .build();
    }

    private ListingFeePaymentRequest enrichWithTotalFee(ListingFeePaymentRequest request, Long userId, BigDecimal totalFee) {
        return new ListingFeePaymentRequest(
                request.listingId(),
                userId,
                totalFee,
                request.currency(),
                request.paymentType(),
                request.verificationCode(),
                request.agreementsAccepted(),
                request.acceptedAgreementIds(),
                request.idempotencyKey()
        );
    }
}
