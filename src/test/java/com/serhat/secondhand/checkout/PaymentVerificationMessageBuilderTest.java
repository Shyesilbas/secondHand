package com.serhat.secondhand.checkout;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.checkout.application.CheckoutPricingContextFactory;
import com.serhat.secondhand.checkout.application.PaymentVerificationMessageBuilder;
import com.serhat.secondhand.core.config.AppConfigProperties;
import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.common.ListingCommandService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.showcase.application.ShowcasePricingCalculator;
import com.serhat.secondhand.showcase.validator.ShowcaseValidator;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class PaymentVerificationMessageBuilderTest {

    private ListingCommandService listingCommandService;
    private AppConfigProperties appConfigProperties;
    private PaymentVerificationMessageBuilder builder;
    private final User user = mock(User.class);

    @BeforeEach
    void setUp() {
        ShowcaseConfig showcaseConfig = new ShowcaseConfig();
        ShowcaseConfig.Daily daily = new ShowcaseConfig.Daily();
        daily.setCost(new BigDecimal("10.00"));
        ShowcaseConfig.Fee fee = new ShowcaseConfig.Fee();
        fee.setTax(new BigDecimal("18"));
        showcaseConfig.setDaily(daily);
        showcaseConfig.setFee(fee);

        listingCommandService = mock(ListingCommandService.class);
        appConfigProperties = new AppConfigProperties();
        appConfigProperties.getMembership().setPremiumPrice(new BigDecimal("149.90"));

        builder = new PaymentVerificationMessageBuilder(mock(ListingQueryService.class), listingCommandService,
                new ShowcasePricingCalculator(showcaseConfig), new ShowcaseValidator(showcaseConfig),
                appConfigProperties, mock(IPricingService.class), mock(CheckoutPricingContextFactory.class),
                mock(CartRepository.class));
    }

    private static InitiateVerificationRequest request(PaymentTransactionType type, Integer days) {
        InitiateVerificationRequest req = new InitiateVerificationRequest();
        req.setTransactionType(type);
        req.setDays(days);
        return req;
    }

    @Test
    void showcaseEmail_showsServerComputedTotalForRequestedDays() {
        String html = builder.buildPaymentDetails(user, PaymentTransactionType.SHOWCASE_PAYMENT,
                request(PaymentTransactionType.SHOWCASE_PAYMENT, 7));

        assertThat(html).contains("82,60 TL").contains("7 Gün");
    }

    @Test
    void showcaseEmail_rejectsMissingOrOutOfRangeDays() {
        assertThatThrownBy(() -> builder.buildPaymentDetails(user, PaymentTransactionType.SHOWCASE_PAYMENT,
                request(PaymentTransactionType.SHOWCASE_PAYMENT, null)))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> builder.buildPaymentDetails(user, PaymentTransactionType.SHOWCASE_PAYMENT,
                request(PaymentTransactionType.SHOWCASE_PAYMENT, 31)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void membershipEmail_showsConfiguredPremiumPrice() {
        String html = builder.buildPaymentDetails(user, PaymentTransactionType.MEMBERSHIP_PAYMENT,
                request(PaymentTransactionType.MEMBERSHIP_PAYMENT, null));

        assertThat(html).contains("149,90 TL");
    }

    @Test
    void listingEmail_usesListingCommandServiceFee() {
        when(listingCommandService.calculateTotalListingFee()).thenReturn(new BigDecimal("59.00"));

        String html = builder.buildPaymentDetails(user, PaymentTransactionType.LISTING_CREATION,
                request(PaymentTransactionType.LISTING_CREATION, null));

        assertThat(html).contains("59,00 TL");
    }
}
