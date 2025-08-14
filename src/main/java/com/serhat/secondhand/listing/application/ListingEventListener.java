package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.serhat.secondhand.user.domain.entity.User;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingEventListener {

    private final ListingRepository listingRepository;
    private final EmailService emailService;

    @EventListener
    @Transactional
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        Payment payment = event.getPayment();
        log.info("Handling PaymentCompletedEvent for payment ID: {} and listing ID: {}", payment.getId(), payment.getListingId());

        if (payment.getListingId() == null) {
            log.warn("Payment {} has no associated listing ID. Skipping.", payment.getId());
            return;
        }

        Listing listing = listingRepository.findById(payment.getListingId())
                .orElseThrow(() -> new BusinessException("Listing not found for payment: " + payment.getId(),
                                                         HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));

        if (payment.getTransactionType() == PaymentTransactionType.LISTING_CREATION) {
            listing.setListingFeePaid(true);
            listing.setStatus(ListingStatus.ACTIVE);
            listingRepository.save(listing);
            log.info("Listing {} fee marked as paid.", listing.getId());

        } else if (payment.getTransactionType() == PaymentTransactionType.ITEM_PURCHASE) {
            if (listing.getStatus() == ListingStatus.ACTIVE) {
                listing.setStatus(ListingStatus.SOLD);
                listingRepository.save(listing);
                log.info("Listing {} marked as SOLD due to successful purchase payment.", listing.getId());
            } else {
                log.warn("Received item purchase payment for listing {} which is not in ACTIVE status (current: {}).", 
                         listing.getId(), listing.getStatus());
            }
        }

        User user = payment.getFromUser();
        PaymentDto paymentDto = new PaymentDto(
                payment.getId(),
                user.getName(),
                user.getSurname(),
                payment.getToUser() != null ? payment.getToUser().getName() : "SYSTEM",
                payment.getToUser() != null ? payment.getToUser().getSurname() : "",
                payment.getAmount(),
                payment.getPaymentType(),
                payment.getTransactionType(),
                payment.getPaymentDirection(),
                payment.getListingId(),
                payment.getProcessedAt(),
                payment.isSuccess()
        );
        emailService.sendPaymentSuccessEmail(user, paymentDto, listing.getTitle());
        log.info("Payment success email sent for payment ID: {}", payment.getId());
    }
}
