package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.VerificationConfig;
import com.serhat.secondhand.core.exception.BusinessException;
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
            if (paymentDto.transactionType() == com.serhat.secondhand.payment.entity.PaymentTransactionType.MEMBERSHIP_PAYMENT) {
                sendMembershipUpgradeEmail(user, paymentDto);
                sendMembershipUpgradeNotification(user, paymentDto);
                return;
            }

            String typeLabel = getLocalizedTransactionType(paymentDto.transactionType());
            String subject = emailConfig.getPaymentSuccessSubject();
            String listingTitle = paymentDto.listingTitle() != null ? paymentDto.listingTitle() : "Ödeme";
            String methodLabel = paymentDto.paymentType() != null ? (paymentDto.paymentType().name().equals("EWALLET") ? "E-Cüzdan (E-Wallet)" : paymentDto.paymentType().name()) : "E-Cüzdan (E-Wallet)";
            String formattedDate = paymentDto.processedAt() != null ? DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").format(paymentDto.processedAt()) : DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").format(java.time.LocalDateTime.now());

            StringBuilder sb = new StringBuilder();
            sb.append("<p>'").append(listingTitle).append("' başlıklı ilan için ödemeniz başarıyla tamamlandı.</p>");
            sb.append("<table role=\"presentation\" style=\"width: 100%; border-collapse: collapse; margin-top: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">");
            sb.append("  <tr>");
            sb.append("    <td style=\"padding: 18px 20px;\">");
            sb.append("      <h3 style=\"margin-top: 0; margin-bottom: 16px; font-size: 14px; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">İşlem Detayları</h3>");
            sb.append("      <table role=\"presentation\" style=\"width: 100%; border-collapse: collapse;\">");
            
            // Transaction ID
            sb.append("        <tr>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">İşlem Numarası</td>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">#")
              .append(paymentDto.paymentId() != null ? paymentDto.paymentId().toString().substring(0, 8).toUpperCase() : "").append("</td>");
            sb.append("        </tr>");

            // Service Row
            sb.append("        <tr>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">Hizmet / Tür</td>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
              .append(typeLabel).append("</td>");
            sb.append("        </tr>");

            // Listing title row
            sb.append("        <tr>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">İlan</td>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
              .append(listingTitle).append("</td>");
            sb.append("        </tr>");

            // Payment method
            sb.append("        <tr>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">Ödeme Yöntemi</td>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
              .append(methodLabel).append("</td>");
            sb.append("        </tr>");

            // Date
            sb.append("        <tr>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">İşlem Tarihi</td>");
            sb.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
              .append(formattedDate).append("</td>");
            sb.append("        </tr>");

            // Total Amount
            sb.append("        <tr>");
            sb.append("          <td style=\"padding: 12px 0 0 0; color: #0f172a; font-size: 13px; font-weight: 700;\">Toplam Ödenen</td>");
            sb.append("          <td style=\"padding: 12px 0 0 0; color: #4f46e5; font-size: 14px; font-weight: 700; text-align: right;\">")
              .append(paymentDto.amount()).append(" ").append(paymentDto.currency()).append("</td>");
            sb.append("        </tr>");

            sb.append("      </table>");
            sb.append("    </td>");
            sb.append("  </tr>");
            sb.append("</table>");

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("Ödeme Başarılı")
                    .message(sb.toString())
                    .build();

            emailEventPublisher.publish(new PaymentSuccessEmailEvent(user, subject, data));
            log.info("Payment success email event published for user: {}", user.getEmail());

            String amountText = paymentDto.amount() != null ? paymentDto.amount().toPlainString() : "";
            String cur = paymentDto.currency() != null ? paymentDto.currency() : "";
            notificationEventPublisher.publishDispatch(
                    notificationTemplateCatalog.paymentSucceeded(
                            user.getId(), amountText, cur, paymentDto.listingTitle(), typeLabel),
                    "payment", "payment-success:" + user.getId() + ":" + paymentDto.paymentId());
        } catch (Exception e) {
            log.warn("Failed to publish payment success notification for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private String getLocalizedTransactionType(com.serhat.secondhand.payment.entity.PaymentTransactionType type) {
        if (type == null) return "Ödeme";
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
                .amount(paymentDto.amount().toPlainString() + " " + paymentDto.currency())
                .paymentId(paymentDto.paymentId().toString())
                .date(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").format(java.time.LocalDateTime.now()))
                .expiryDate(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").format(java.time.LocalDateTime.now().plusDays(30)))
                .build();

        emailEventPublisher.publish(new MembershipUpgradeEmailEvent(user, subject, data));
        log.info("Premium confirmation email event published for user: {}", user.getEmail());
    }

    private void sendMembershipUpgradeNotification(User user, PaymentDto paymentDto) {
        com.serhat.secondhand.notification.dto.NotificationRequest req = com.serhat.secondhand.notification.dto.NotificationRequest.of(
                user.getId(),
                com.serhat.secondhand.notification.entity.enums.NotificationType.PAYMENT_SUCCESS,
                "Premium Üyelik Aktif",
                "Tebrikler! Premium üyeliğiniz başarıyla aktif edildi. Premium avantajlarınızın tadını çıkarın.",
                "/profile",
                "{}"
        );
        notificationEventPublisher.publishDispatch(req, "payment", "membership-success:" + user.getId() + ":" + paymentDto.paymentId());
        log.info("Premium in-app notification sent to user: {}", user.getId());
    }

    public void sendPaymentVerificationNotification(User user, String code, String extraDetails) {
        try {
            String subject = emailConfig.getPaymentVerificationSubject();
            String base = String.format(
                "<div style=\"text-align: center; margin: 24px 0;\">" +
                "  <p style=\"margin-bottom: 8px; font-size: 14px; color: #64748b; font-weight: 500;\">Ödeme Doğrulama Kodunuz</p>" +
                "  <div style=\"display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 28px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5; font-family: monospace;\">%s</div>" +
                "  <p style=\"margin-top: 8px; font-size: 13px; color: #94a3b8;\">Bu kod %d dakika boyunca geçerlidir.</p>" +
                "</div>",
                code, verificationConfig.getExpiryMinutes()
            );
            String content = base + (extraDetails != null ? extraDetails : "");

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("Ödeme Doğrulama")
                    .message(content)
                    .build();

            log.info("Attempting to publish payment verification email event for user: {}, code: {}", user.getEmail(), code);
            emailEventPublisher.publish(new PaymentVerificationEmailEvent(user, subject, data));
            log.info("Payment verification email event published successfully for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to publish payment verification notification for user {}: {}", user.getEmail(), e.getMessage(), e);
            throw new BusinessException("Failed to send payment verification email: " + e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "PAYMENT_VERIFICATION_EMAIL_FAILED");
        }
    }
}
