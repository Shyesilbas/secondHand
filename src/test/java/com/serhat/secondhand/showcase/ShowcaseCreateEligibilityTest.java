package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.showcase.application.ShowcasePricingCalculator;
import com.serhat.secondhand.showcase.application.ShowcaseRedisManagerService;
import com.serhat.secondhand.showcase.application.ShowcaseService;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.repository.ShowcaseRepository;
import com.serhat.secondhand.showcase.validator.ShowcaseValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.PlanValidator;
import com.serhat.secondhand.user.application.UserBlockService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ShowcaseCreateEligibilityTest {

    private static final long OWNER_ID = 7L;
    private static final long OTHER_ID = 8L;

    private ShowcaseRepository showcaseRepository;
    private ListingQueryService listingService;
    private PaymentProcessor paymentProcessor;
    private IUserService userService;
    private ShowcaseService service;
    private Listing listing;
    private final UUID listingId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        ShowcaseConfig config = new ShowcaseConfig();
        ShowcaseConfig.Daily daily = new ShowcaseConfig.Daily();
        daily.setCost(new BigDecimal("10.00"));
        ShowcaseConfig.Fee fee = new ShowcaseConfig.Fee();
        fee.setTax(new BigDecimal("18"));
        config.setDaily(daily);
        config.setFee(fee);
        config.setMaxDays(30);

        showcaseRepository = mock(ShowcaseRepository.class);
        listingService = mock(ListingQueryService.class);
        paymentProcessor = mock(PaymentProcessor.class);
        userService = mock(IUserService.class);
        service = new ShowcaseService(config, showcaseRepository, mock(ShowcaseMapper.class),
                listingService, paymentProcessor, userService,
                new ShowcaseValidator(config), mock(PaymentRequestFactory.class), mock(PlanValidator.class),
                mock(ShowcaseRedisManagerService.class), new ShowcasePricingCalculator(config),
                mock(IEWalletService.class), mock(UserBlockService.class));

        User owner = mock(User.class);
        when(owner.getId()).thenReturn(OWNER_ID);
        listing = mock(Listing.class);
        when(listing.getId()).thenReturn(listingId);
        when(listing.getSeller()).thenReturn(owner);
        when(listingService.findById(listingId)).thenReturn(Optional.of(listing));
    }

    private void callerIs(long userId) {
        User caller = mock(User.class);
        when(caller.getId()).thenReturn(userId);
        when(userService.findById(userId)).thenReturn(Result.success(caller));
    }

    @Test
    void rejectsShowcasingSomeoneElsesListingWithoutCharging() {
        callerIs(OTHER_ID);

        Result<Showcase> result = service.createShowcase(OTHER_ID, new ShowcasePaymentRequest(listingId, 7, "EWALLET", "123456", true, List.of(), "key-1"));

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(ListingErrorCodes.NOT_LISTING_OWNER.getCode());
        verify(paymentProcessor, never()).executeSinglePayment(anyLong(), any());
    }

    @Test
    void rejectsSecondActiveShowcaseForSameListingWithoutCharging() {
        callerIs(OWNER_ID);
        when(showcaseRepository.existsByListingIdAndEndDateAfter(eq(listingId), any())).thenReturn(true);

        Result<Showcase> result = service.createShowcase(OWNER_ID, new ShowcasePaymentRequest(listingId, 7, "EWALLET", "123456", true, List.of(), "key-1"));

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(ShowcaseErrorCodes.ALREADY_IN_SHOWCASE.getCode());
        verify(paymentProcessor, never()).executeSinglePayment(anyLong(), any());
    }
}
