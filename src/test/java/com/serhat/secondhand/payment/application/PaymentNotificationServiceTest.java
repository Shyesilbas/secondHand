package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.VerificationConfig;
import com.serhat.secondhand.email.application.EmailLinks;
import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentNotificationServiceTest {

    private final EmailEventPublisher emailEventPublisher = mock(EmailEventPublisher.class);
    private final VerificationConfig verificationConfig = mock(VerificationConfig.class);
    private final PaymentNotificationService service = new PaymentNotificationService(
            verificationConfig, emailEventPublisher, mock(EmailConfig.class),
            mock(NotificationEventPublisher.class), mock(NotificationTemplateCatalog.class));

    private static User user() {
        User user = mock(User.class);
        when(user.getName()).thenReturn("Luka");
        when(user.getEmail()).thenReturn("luka@example.com");
        return user;
    }

    private static PaymentDto payment(PaymentTransactionType type, UUID paymentId, String provider, String listingTitle) {
        return new PaymentDto(paymentId, null, null, new BigDecimal("1000000"), "TRY", provider, null, type,
                PaymentDirection.OUTGOING, null, listingTitle, null, LocalDateTime.of(2026, 11, 15, 14, 22),
                PaymentStatus.COMPLETED, true, null);
    }

    @SuppressWarnings("unchecked")
    private GenericEmailData publishedData() {
        ArgumentCaptor<EmailEvent<GenericEmailData>> captor = ArgumentCaptor.forClass(EmailEvent.class);
        verify(emailEventPublisher).publish(captor.capture());
        return captor.getValue().getData();
    }

    @Test
    void walletDepositReceiptCarriesNoListingOrPlaceholderValues() {
        service.sendPaymentSuccessNotification(user(), payment(PaymentTransactionType.EWALLET_DEPOSIT, null, null, null));

        GenericEmailData data = publishedData();
        assertThat(data.getHeaderTitle()).isEqualTo("Para Yükleme Tamamlandı");
        assertThat(data.getAmountLabel()).isEqualTo("Yüklenen Tutar");
        assertThat(data.getListingTitle()).isNull();
        assertThat(data.getPaymentMethod()).isNull();
        assertThat(data.getTransactionNumber()).isNull();
        assertThat(data.getActionUrl()).isEqualTo(EmailLinks.WALLET);
    }

    @Test
    void purchaseReceiptLinksToOrdersAndKeepsRealValues() {
        UUID paymentId = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000000");

        service.sendPaymentSuccessNotification(user(),
                payment(PaymentTransactionType.ITEM_PURCHASE, paymentId, "EWALLET", "Bisiklet"));

        GenericEmailData data = publishedData();
        assertThat(data.getAmountLabel()).isEqualTo("Ödenen Tutar");
        assertThat(data.getListingTitle()).isEqualTo("Bisiklet");
        assertThat(data.getPaymentMethod()).isEqualTo("E-Cüzdan");
        assertThat(data.getTransactionNumber()).isEqualTo("A1B2C3D4");
        assertThat(data.getTransactionDate()).isEqualTo("15.11.2026 14:22");
        assertThat(data.getActionUrl()).isEqualTo(EmailLinks.MY_ORDERS);
    }

    @Test
    void saleReceiptIsWordedAsIncomingMoney() {
        service.sendPaymentSuccessNotification(user(),
                payment(PaymentTransactionType.ITEM_SALE, UUID.randomUUID(), "EWALLET", "Bisiklet"));

        GenericEmailData data = publishedData();
        assertThat(data.getAmountLabel()).isEqualTo("Alınan Tutar");
        assertThat(data.getActionUrl()).isEqualTo(EmailLinks.MY_SALES);
    }

    @Test
    void verificationMailCarriesTheCodeAsAFieldNotMarkup() {
        when(verificationConfig.getExpiryMinutes()).thenReturn(15);

        service.sendPaymentVerificationNotification(user(), "123456", null);

        GenericEmailData data = publishedData();
        assertThat(data.getVerificationCode()).isEqualTo("123456");
        assertThat(data.getCodeHint()).contains("15 dakika");
        assertThat(data.getMessage()).isNull();
    }
}
