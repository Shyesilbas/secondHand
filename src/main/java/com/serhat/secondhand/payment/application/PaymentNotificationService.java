package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.VerificationConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.application.EmailLinks;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.MembershipUpgradeEmailEvent;
import com.serhat.secondhand.email.application.event.impl.PaymentSuccessEmailEvent;
import com.serhat.secondhand.email.application.event.impl.PaymentVerificationEmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.application.event.model.MembershipUpgradeEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentNotificationService {

        private final VerificationConfig verificationConfig;
        private final EmailEventPublisher emailEventPublisher;
        private final EmailConfig emailConfig;
        private final NotificationEventPublisher notificationEventPublisher;
        private final NotificationTemplateCatalog notificationTemplateCatalog;

        @Async("notificationExecutor")
        public void sendPaymentSuccessNotification(User user, PaymentDto paymentDto) {
                try {
                        if (paymentDto
                                        .transactionType() == com.serhat.secondhand.payment.entity.PaymentTransactionType.MEMBERSHIP_PAYMENT) {
                                sendMembershipUpgradeEmail(user, paymentDto);
                                sendMembershipUpgradeNotification(user, paymentDto);
                                return;
                        }

                        ReceiptCopy copy = receiptCopy(paymentDto.transactionType());
                        String typeLabel = getLocalizedTransactionType(paymentDto.transactionType());
                        String formattedDate = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
                                        .format(paymentDto.processedAt() != null ? paymentDto.processedAt()
                                                        : java.time.LocalDateTime.now());

                        // Fields without a real value stay null so the receipt omits the row.
                        var data = GenericEmailData.builder()
                                        .userName(user.getName())
                                        .headerTitle(copy.title())
                                        .message(copy.intro())
                                        .amountLabel(copy.amountLabel())
                                        .amount(formatMoney(paymentDto.amount()))
                                        .currency(paymentDto.currency() != null ? paymentDto.currency() : "TRY")
                                        .transactionNumber(shortReference(paymentDto.paymentId()))
                                        .typeLabel(typeLabel)
                                        .listingTitle(paymentDto.listingTitle())
                                        .paymentMethod(paymentMethodLabel(paymentDto.providerName()))
                                        .transactionDate(formattedDate)
                                        .actionText(copy.actionText())
                                        .actionUrl(copy.actionUrl())
                                        .build();
                        String subject = emailConfig.getPaymentSuccessSubject();

                        emailEventPublisher.publish(new PaymentSuccessEmailEvent(user, subject, data));
                        log.info("Payment success email event published for user: {}", user.getEmail());

                        String amountText = paymentDto.amount() != null ? paymentDto.amount().toPlainString() : "";
                        String cur = paymentDto.currency() != null ? paymentDto.currency() : "";
                        String typeCode = paymentDto.transactionType() != null ? paymentDto.transactionType().name()
                                        : "";
                        notificationEventPublisher.publishDispatch(
                                        notificationTemplateCatalog.paymentSucceeded(
                                                        user.getId(), amountText, cur, paymentDto.listingTitle(),
                                                        typeLabel, typeCode, paymentDto.listingId()),
                                        "payment", "payment-success:" + user.getId() + ":" + paymentDto.paymentId());
                } catch (RuntimeException e) {
                        log.warn("Failed to publish payment success notification for user {}: {}", user.getEmail(),
                                        e.getMessage());
                }
        }

        private String getLocalizedTransactionType(com.serhat.secondhand.payment.entity.PaymentTransactionType type) {
                if (type == null)
                        return "Ödeme";
                return switch (type) {
                        case LISTING_CREATION -> "İlan Oluşturma";
                        case ITEM_PURCHASE -> "Ürün Satın Alma";
                        case ITEM_SALE -> "Ürün Satışı";
                        case REFUND -> "İade";
                        case EWALLET_DEPOSIT -> "Cüzdana Para Yükleme";
                        case EWALLET_WITHDRAWAL -> "Cüzdandan Para Çekme";
                        case EWALLET_PAYMENT_RECEIVED -> "Ödeme Alma";
                        case SHOWCASE_PAYMENT -> "İlan Öne Çıkarma";
                        case MEMBERSHIP_PAYMENT -> "Premium Üyelik";
                };
        }

        private void sendMembershipUpgradeEmail(User user, PaymentDto paymentDto) {
                String subject = "Premium Üyeliğiniz Aktif Edildi!";
                var data = MembershipUpgradeEmailData.builder()
                                .userName(user.getName())
                                .amount(formatMoney(paymentDto.amount()) + " "
                                                + (paymentDto.currency() != null ? paymentDto.currency() : "TRY"))
                                .paymentId(shortReference(paymentDto.paymentId()))
                                .benefits(com.serhat.secondhand.user.domain.entity.enums.MembershipPlan.PREMIUM.getBenefits())
                                .date(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
                                                .format(java.time.LocalDateTime.now()))
                                .expiryDate(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
                                                .format(java.time.LocalDateTime.now().plusDays(30)))
                                .build();

                emailEventPublisher.publish(new MembershipUpgradeEmailEvent(user, subject, data));
                log.info("Premium confirmation email event published for user: {}", user.getEmail());
        }

        private void sendMembershipUpgradeNotification(User user, PaymentDto paymentDto) {
                String amountText = paymentDto.amount() != null ? paymentDto.amount().toPlainString() : "";
                String cur = paymentDto.currency() != null ? paymentDto.currency() : "TRY";
                com.serhat.secondhand.notification.dto.NotificationRequest base = notificationTemplateCatalog
                                .paymentSucceeded(
                                                user.getId(),
                                                amountText,
                                                cur,
                                                null,
                                                "Premium Üyelik",
                                                com.serhat.secondhand.payment.entity.PaymentTransactionType.MEMBERSHIP_PAYMENT
                                                                .name(),
                                                null);
                com.serhat.secondhand.notification.dto.NotificationRequest req = com.serhat.secondhand.notification.dto.NotificationRequest
                                .of(
                                                user.getId(),
                                                com.serhat.secondhand.notification.entity.enums.NotificationType.PAYMENT_SUCCESS,
                                                "Premium Üyelik Aktif",
                                                "Tebrikler! Premium üyeliğiniz başarıyla aktif edildi. Premium avantajlarınızın tadını çıkarın.",
                                                "/profile",
                                                base.getMetadata());
                notificationEventPublisher.publishDispatch(req, "payment",
                                "membership-success:" + user.getId() + ":" + paymentDto.paymentId());
                log.info("Premium in-app notification sent to user: {}", user.getId());
        }

        public void sendPaymentVerificationNotification(User user, String code, String extraDetails) {
                try {
                        String subject = emailConfig.getPaymentVerificationSubject();
                        var data = GenericEmailData.builder()
                                        .userName(user.getName())
                                        .headerTitle("Ödeme Doğrulama")
                                        .verificationCode(code)
                                        .codeLabel("Ödeme doğrulama kodunuz")
                                        .codeHint("Kod " + verificationConfig.getExpiryMinutes()
                                                        + " dakika geçerlidir. Kimseyle paylaşmayın.")
                                        .message(extraDetails)
                                        .build();

                        log.info("Attempting to publish payment verification email event for user: {}, code: {}",
                                        user.getEmail(),
                                        code);
                        emailEventPublisher.publish(new PaymentVerificationEmailEvent(user, subject, data));
                        log.info("Payment verification email event published successfully for user: {}",
                                        user.getEmail());
                } catch (RuntimeException e) {
                        log.error("Failed to publish payment verification notification for user {}: {}",
                                        user.getEmail(),
                                        e.getMessage(), e);
                        throw new BusinessException("Failed to send payment verification email: " + e.getMessage(),
                                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                                        "PAYMENT_VERIFICATION_EMAIL_FAILED");
                }
        }

        private record ReceiptCopy(String title, String intro, String amountLabel, String actionText,
                        String actionUrl) {
        }

        /** Wording and link per transaction type; the receipt template itself is type-agnostic. */
        private ReceiptCopy receiptCopy(com.serhat.secondhand.payment.entity.PaymentTransactionType type) {
                if (type == null) {
                        return new ReceiptCopy("Ödeme Başarılı", "Ödeme işleminiz tamamlandı.", "Tutar",
                                        "Ödemelerimi Gör", EmailLinks.PAYMENTS);
                }
                return switch (type) {
                        case ITEM_PURCHASE -> new ReceiptCopy("Ödemeniz Alındı", "Satın alma ödemeniz alındı.",
                                        "Ödenen Tutar", "Siparişlerimi Gör", EmailLinks.MY_ORDERS);
                        case ITEM_SALE, EWALLET_PAYMENT_RECEIVED -> new ReceiptCopy("Ödeme Aldınız",
                                        "Satışınızın ödemesi cüzdanınıza aktarıldı.", "Alınan Tutar",
                                        "Satışlarımı Gör", EmailLinks.MY_SALES);
                        case REFUND -> new ReceiptCopy("İade Tamamlandı", "İade işlemi tamamlandı.",
                                        "İade Tutarı", "Cüzdanımı Gör", EmailLinks.WALLET);
                        case EWALLET_DEPOSIT -> new ReceiptCopy("Para Yükleme Tamamlandı",
                                        "Cüzdanınıza para yüklendi.", "Yüklenen Tutar", "Cüzdanımı Gör",
                                        EmailLinks.WALLET);
                        case EWALLET_WITHDRAWAL -> new ReceiptCopy("Para Çekme Tamamlandı",
                                        "Cüzdanınızdan para çekme işlemi tamamlandı.", "Çekilen Tutar",
                                        "Cüzdanımı Gör", EmailLinks.WALLET);
                        case LISTING_CREATION -> new ReceiptCopy("İlan Ücreti Ödendi", "İlan ücreti ödemeniz alındı.",
                                        "Ödenen Tutar", "İlanlarıma Git", EmailLinks.MY_LISTINGS);
                        case SHOWCASE_PAYMENT -> new ReceiptCopy("Vitrin Ödemesi Alındı",
                                        "İlanınızı öne çıkarma ödemeniz alındı.", "Ödenen Tutar", "Vitrinlerimi Gör",
                                        EmailLinks.MY_SHOWCASES);
                        case MEMBERSHIP_PAYMENT -> new ReceiptCopy("Premium Üyelik Ödemesi",
                                        "Premium üyelik ödemeniz alındı.", "Ödenen Tutar", "Profilimi Görüntüle",
                                        EmailLinks.PROFILE);
                };
        }

        private String paymentMethodLabel(String providerName) {
                if (providerName == null || providerName.isBlank()) {
                        return null;
                }
                return "EWALLET".equals(providerName) ? "E-Cüzdan" : providerName;
        }

        private String shortReference(java.util.UUID paymentId) {
                return paymentId != null ? paymentId.toString().substring(0, 8).toUpperCase() : null;
        }

        private String formatMoney(BigDecimal amount) {
                if (amount == null)
                        return "0,00";
                return String.format(java.util.Locale.forLanguageTag("tr-TR"), "%,.2f", amount);
        }
}
