package com.serhat.secondhand.listing.infrastructure.adapter;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.port.ListingFeePaymentPort;
import com.serhat.secondhand.listing.domain.dto.request.listing.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.util.PaymentProcessingConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentModuleAdapter implements ListingFeePaymentPort {

    private final PaymentProcessor paymentProcessor;
    private final PaymentRepository paymentRepository;

    @Override
    public Result<UUID> processListingFee(ListingFeePaymentRequest request) {
        log.info("Processing listing fee payment for listing: {}", request.listingId());
        
        PaymentRequest paymentRequest = mapToPaymentRequest(request);
        Result<PaymentDto> result = paymentProcessor.executeSinglePayment(request.userId(), paymentRequest);
        
        if (result.isError()) {
            log.error("Listing fee payment failed: {}", result.getMessage());
            return Result.error(result.getMessage(), result.getErrorCode());
        }
        
        UUID paymentId = result.getData().paymentId();
        log.info("Listing fee payment completed. PaymentId: {}", paymentId);
        return Result.success(paymentId);
    }

    @Override
    public boolean isPaymentCompleted(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .map(Payment::isSuccess)
                .orElse(false);
    }

    private PaymentRequest mapToPaymentRequest(ListingFeePaymentRequest request) {
        return PaymentRequest.builder()
                .fromUserId(request.userId())
                .toUserId(null)
                .receiverName(PaymentProcessingConstants.SYSTEM_RECEIVER_NAME)
                .receiverSurname(PaymentProcessingConstants.PAYMENT_RECEIVER_SURNAME)
                .listingId(request.listingId())
                .amount(request.amount())
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.LISTING_CREATION)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .agreementsAccepted(request.agreementsAccepted())
                .acceptedAgreementIds(request.acceptedAgreementIds())
                .idempotencyKey(request.idempotencyKey())
                .build();
    }
}
