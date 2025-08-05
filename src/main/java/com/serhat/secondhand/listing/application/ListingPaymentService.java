package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.ListingPaymentRequest;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.ListingRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.service.IPaymentService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingPaymentService {

    private final IPaymentService paymentService;
    private final ListingRepository listingRepository;

    @Getter
    @Value("${app.listing.creation.fee:50.00}")
    private BigDecimal listingCreationFee;

    @Getter
    @Value("${app.listing.promotion.fee:25.00}")
    private BigDecimal listingPromotionFee;


    @Transactional
    public PaymentDto processListingCreationPayment(User user, ListingPaymentRequest paymentRequest) {
        log.info("Processing listing creation payment for user: {} and listing: {}", 
                 user.getEmail(), paymentRequest.listingId());

        Listing listing = listingRepository.findById(paymentRequest.listingId())
                .orElseThrow(() -> new BusinessException("Listing not found", 
                                                      HttpStatus.NOT_FOUND, 
                                                      HttpStatus.NOT_FOUND.toString()));

        if (!listing.getSeller().getId().equals(user.getId())) {
            throw new BusinessException("You can only pay for your own listings", 
                                      HttpStatus.FORBIDDEN, 
                                      HttpStatus.FORBIDDEN.toString());
        }

        if (listing.getStatus() != ListingStatus.DRAFT) {
            throw new BusinessException("Listing must be in DRAFT status for payment", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        PaymentRequest request = new PaymentRequest(
                user.getId(),
                paymentRequest.listingId(),
                listingCreationFee,
                paymentRequest.paymentType(),
                PaymentTransactionType.LISTING_CREATION,
                PaymentDirection.OUTGOING,
                paymentRequest.creditCard()
        );

        try {
            PaymentDto paymentResult = paymentService.createPayment(request);

            if (paymentResult.isSuccess()) {
                listing.setStatus(ListingStatus.ACTIVE);
                listingRepository.save(listing);
                log.info("Listing {} activated after successful payment", listing.getId());
            } else {
                log.warn("Payment failed for listing {}, keeping status as DRAFT", listing.getId());
            }

            return paymentResult;

        } catch (Exception e) {
            log.error("Error processing listing creation payment: {}", e.getMessage(), e);
            throw new BusinessException("Payment processing failed: " + e.getMessage(), 
                                      HttpStatus.INTERNAL_SERVER_ERROR, 
                                      HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
    }


    @Transactional
    public PaymentDto processItemPurchasePayment(User buyer, UUID listingId, ListingPaymentRequest paymentRequest) {
        log.info("Processing item purchase payment for user: {} and listing: {}", 
                 buyer.getEmail(), listingId);

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", 
                                                      HttpStatus.NOT_FOUND, 
                                                      HttpStatus.NOT_FOUND.toString()));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BusinessException("Listing is not available for purchase", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        if (listing.getSeller().getId().equals(buyer.getId())) {
            throw new BusinessException("You cannot purchase your own listing", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        PaymentRequest request = new PaymentRequest(
                listing.getSeller().getId(),
                listingId,
                listing.getPrice(),
                paymentRequest.paymentType(),
                PaymentTransactionType.ITEM_PURCHASE,
                PaymentDirection.OUTGOING,
                paymentRequest.creditCard()
        );

        try {
            PaymentDto paymentResult = paymentService.createPayment(request);

            if (paymentResult.isSuccess()) {
                listing.setStatus(ListingStatus.SOLD);
                listingRepository.save(listing);
                log.info("Listing {} marked as SOLD after successful purchase", listing.getId());
            } else {
                log.warn("Purchase payment failed for listing {}", listing.getId());
            }

            return paymentResult;

        } catch (Exception e) {
            log.error("Error processing item purchase payment: {}", e.getMessage(), e);
            throw new BusinessException("Purchase payment processing failed: " + e.getMessage(), 
                                      HttpStatus.INTERNAL_SERVER_ERROR, 
                                      HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
    }


}