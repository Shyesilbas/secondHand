package com.serhat.secondhand.email.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.email.mapper.EmailMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import org.springframework.beans.factory.annotation.Value;
import com.serhat.secondhand.email.config.EmailConfig;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService {

    private final EmailRepository emailRepository;
    private final EmailMapper emailMapper;
    private final EmailConfig emailConfig;

    @Value("${app.verification.code.expiry.minutes:3}")
    private int verificationExpiryMinutes;

    public EmailDto sendVerificationCodeEmail(User user, String verificationCode) {
        String subject = emailConfig.getVerificationSubject();
        String content = String.format(emailConfig.getVerificationContent(), user.getName(), verificationCode);
        return sendAndSaveEmail(user, subject, content, EmailType.VERIFICATION_CODE);
    }

    public EmailDto sendPhoneNumberUpdatedEmail(User user) {
        String subject = emailConfig.getPhoneUpdateSubject();
        String content = String.format(emailConfig.getPhoneUpdateContent(), user.getName());
        return sendAndSaveEmail(user, subject, content, EmailType.NOTIFICATION);
    }

    public EmailDto sendWelcomeEmail(User user) {
        String subject = emailConfig.getWelcomeSubject();
        String content = String.format(emailConfig.getWelcomeContent(), user.getName());
        return sendAndSaveEmail(user, subject, content, EmailType.WELCOME);
    }

    public EmailDto sendPaymentSuccessEmail(User user, PaymentDto paymentDto, String listingTitle) {
        String subject = emailConfig.getPaymentSuccessSubject();
        String content = String.format(emailConfig.getPaymentSuccessContent(), user.getName(), listingTitle, paymentDto.amount(), paymentDto.transactionType());
        return sendAndSaveEmail(user, subject, content, EmailType.NOTIFICATION);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EmailDto sendPaymentVerificationEmail(User user, String code) {
        log.info("Sending payment verification email to user: {} with code: {}", user.getEmail(), code);
        String subject = emailConfig.getPaymentVerificationSubject();
        String content = String.format(emailConfig.getPaymentVerificationContent(), user.getName(), code, verificationExpiryMinutes);
        log.info("Payment verification email subject: {}", subject);
        log.info("Payment verification email content: {}", content);
        EmailDto result = sendAndSaveEmail(user, subject, content, EmailType.PAYMENT_VERIFICATION);
        log.info("Payment verification email sent successfully with ID: {}", result.id());
        return result;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EmailDto sendPaymentVerificationEmail(User user, String code, String extraDetails) {
        log.info("Sending payment verification email with details to user: {}", user.getEmail());
        String subject = emailConfig.getPaymentVerificationSubject();
        String base = String.format(emailConfig.getPaymentVerificationContent(), user.getName(), code, verificationExpiryMinutes);
        String content = base + (extraDetails != null ? ("\n" + extraDetails) : "");
        EmailDto result = sendAndSaveEmail(user, subject, content, EmailType.PAYMENT_VERIFICATION);
        log.info("Payment verification email (with details) sent successfully with ID: {}", result.id());
        return result;
    }

    public EmailDto sendOrderConfirmationEmail(User user, OrderDto order) {
        log.info("Sending order confirmation email to user: {} for order: {}", user.getEmail(), order.getOrderNumber());
        String subject = emailConfig.getOrderConfirmationSubject();
        String content = buildOrderConfirmationContent(user, order);
        EmailDto result = sendAndSaveEmail(user, subject, content, EmailType.NOTIFICATION);
        log.info("Order confirmation email sent successfully with ID: {}", result.id());
        return result;
    }

    private String buildOrderConfirmationContent(User user, OrderDto order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(user.getName()).append(",\n\n");
        sb.append("Thank you for your purchase! Your order has been confirmed.\n\n");
        sb.append("Order Number: ").append(order.getOrderNumber()).append('\n');
        sb.append("Status: ").append(order.getStatus()).append('\n');
        sb.append("Payment Status: ").append(order.getPaymentStatus()).append('\n');
        sb.append("Total: ").append(order.getTotalAmount()).append(' ').append(order.getCurrency()).append("\n");
        if (order.getShippingAddress() != null) {
            sb.append("\nShipping Address:\n");
            sb.append(order.getShippingAddress().getAddressLine()).append('\n');
            sb.append(order.getShippingAddress().getCity()).append(' ')
              .append(order.getShippingAddress().getState()).append(' ')
              .append(order.getShippingAddress().getPostalCode()).append('\n');
            sb.append(order.getShippingAddress().getCountry()).append('\n');
        }
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            sb.append("\nItems:\n");
            order.getOrderItems().forEach(it -> {
                String title = null;
                try {
                    var listingField = it.getClass().getDeclaredField("listing");
                    listingField.setAccessible(true);
                    Object listing = listingField.get(it);
                    if (listing != null) {
                        try {
                            var getTitle = listing.getClass().getMethod("getTitle");
                            Object val = getTitle.invoke(listing);
                            title = val != null ? String.valueOf(val) : null;
                        } catch (Exception ignored) {}
                        if (title == null) {
                            try {
                                var getListingNo = listing.getClass().getMethod("getListingNo");
                                Object val = getListingNo.invoke(listing);
                                title = val != null ? String.valueOf(val) : null;
                            } catch (Exception ignored) {}
                        }
                    }
                } catch (Exception ignored) {}
                if (title == null) title = "Item";
                sb.append("- ").append(title)
                  .append(" x").append(it.getQuantity())
                  .append(" — ").append(it.getTotalPrice()).append(' ').append(order.getCurrency())
                  .append('\n');
            });
        }
        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            sb.append("\nNotes: ").append(order.getNotes()).append('\n');
        }
        if (order.getPaymentReference() != null) {
            sb.append("Payment Reference: ").append(order.getPaymentReference()).append('\n');
        }
        sb.append("\nBest regards,\nSecondHand Team\n");
        return sb.toString();
    }

    public EmailDto sendSaleNotificationEmail(User seller, OrderDto order, List<OrderItemDto> sellerItems) {
        log.info("Sending sale notification email to seller: {} for order: {}", seller.getEmail(), order.getOrderNumber());
        String subject = emailConfig.getSaleNotificationSubject();
        String content = buildSaleNotificationContent(seller, order, sellerItems);
        EmailDto result = sendAndSaveEmail(seller, subject, content, EmailType.NOTIFICATION);
        log.info("Sale notification email sent successfully with ID: {}", result.id());
        return result;
    }

    private String buildSaleNotificationContent(User seller, OrderDto order, List<OrderItemDto> sellerItems) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(seller.getName()).append(",\n\n");
        sb.append("Great news! Your item(s) have been sold!\n\n");
        sb.append("Order Number: ").append(order.getOrderNumber()).append('\n');
        sb.append("Buyer: ").append(order.getUserId()).append('\n');
        sb.append("Total Amount: ").append(sellerItems.stream()
                .map(OrderItemDto::getTotalPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add))
                .append(' ').append(order.getCurrency()).append("\n\n");
        
        sb.append("Sold Items:\n");
        sellerItems.forEach(item -> {
            String title = "Item";
            if (item.getListing() != null) {
                title = item.getListing().getTitle() != null ? item.getListing().getTitle() : 
                       (item.getListing().getListingNo() != null ? item.getListing().getListingNo() : "Item");
            }
            sb.append("- ").append(title)
              .append(" x").append(item.getQuantity())
              .append(" — ").append(item.getTotalPrice()).append(' ').append(order.getCurrency())
              .append('\n');
        });
        
        if (order.getShippingAddress() != null) {
            sb.append("\nShipping Address:\n");
            sb.append(order.getShippingAddress().getAddressLine()).append('\n');
            sb.append(order.getShippingAddress().getCity()).append(' ')
              .append(order.getShippingAddress().getState()).append(' ')
              .append(order.getShippingAddress().getPostalCode()).append('\n');
            sb.append(order.getShippingAddress().getCountry()).append('\n');
        }
        
        sb.append("\nPlease prepare the item(s) for shipping and contact the buyer if needed.\n");
        sb.append("Thank you for using SecondHand!\n\n");
        sb.append("Best regards,\nSecondHand Team\n");
        return sb.toString();
    }

    public EmailDto sendPriceChangeEmail(User user, String listingTitle, String oldPriceStr, String newPriceStr) {
        String subject = emailConfig.getPriceChangeSubject();
        String content = String.format(emailConfig.getPriceChangeContent(), user.getName(), listingTitle, oldPriceStr, newPriceStr);
        return sendAndSaveEmail(user, subject, content, EmailType.NOTIFICATION);
    }

    private EmailDto sendAndSaveEmail(User user, String subject, String content, EmailType emailType) {
        log.info("sendAndSaveEmail called for user: {}, emailType: {}", user.getEmail(), emailType);
        LocalDateTime now = LocalDateTime.now();
        Email email = Email.builder()
                .user(user)
                .recipientEmail(user.getEmail())
                .senderEmail(emailConfig.getSender())
                .subject(subject)
                .content(content)
                .emailType(emailType)
                .createdAt(now)
                .build();

        log.info("Email entity built: recipientEmail={}, subject={}, emailType={}", email.getRecipientEmail(), email.getSubject(), email.getEmailType());
        
        email = emailRepository.save(email);
        log.info("{} email saved with ID: {}", emailType, email.getId());

        EmailDto result = emailMapper.toDto(email);
        log.info("Email mapped to DTO: id={}, recipientEmail={}, subject={}", result.id(), result.recipientEmail(), result.subject());
        
        return result;
    }

    public List<EmailDto> getUserEmails(User user) {
        List<Email> emails = emailRepository.findByUserOrderByCreatedAtDesc(user);

        return emails.stream().map(emailMapper::toDto).toList();
    }

    public String deleteEmail(UUID emailId) {
        Email email = emailRepository.findById(emailId).orElse(null);
        if (email != null) {
            emailRepository.delete(email);
            return "Email deleted" + email.getId();
        } else {
            throw new BusinessException(
                    "Email not found",
                    HttpStatus.NOT_FOUND,
                    HttpStatus.NOT_FOUND.toString()
            );
        }
    }

    public String deleteAllEmails(User user) {
        List<Email> emails = emailRepository.findByUserOrderByCreatedAtDesc(user);
        emailRepository.deleteAll(emails);
        return "Emails deleted for user : "+user.getEmail();
    }
}
