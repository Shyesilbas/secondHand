package com.serhat.secondhand.moderation;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.chat.application.ChatRoomUpdater;
import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.enricher.ChatRoomEnricher;
import com.serhat.secondhand.chat.mapper.ChatMessageMapper;
import com.serhat.secondhand.chat.mapper.ChatRoomMapper;
import com.serhat.secondhand.chat.notification.ChatNotificationService;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.checkout.application.CheckoutOrchestrator;
import com.serhat.secondhand.checkout.application.CheckoutPricingContextFactory;
import com.serhat.secondhand.checkout.application.CheckoutStockReservationService;
import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.application.CouponService;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.listing.application.common.ListingCommandService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.application.common.ListingValidationService;
import com.serhat.secondhand.listing.application.common.PriceHistoryService;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.offer.application.OfferService;
import com.serhat.secondhand.offer.application.OfferStockHoldService;
import com.serhat.secondhand.offer.config.OfferConfigProperties;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.email.OfferEmailNotificationService;
import com.serhat.secondhand.offer.mapper.OfferMapper;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.offer.validator.OfferValidator;
import com.serhat.secondhand.order.application.OrderCreationService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.application.OrderPaymentService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.UserRestrictionService;
import com.serhat.secondhand.user.domain.entity.enums.RestrictedAction;
import com.serhat.secondhand.user.util.RestrictionErrorCodes;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/** Each guarded entry point refuses a restricted user before doing any work. */
class RestrictionGuardsTest {

    private static final long USER = 9L;

    private final UserRestrictionService restrictions = mock(UserRestrictionService.class);

    private void restricted(RestrictedAction action, RestrictionErrorCodes code) {
        when(restrictions.check(eq(USER), eq(action))).thenReturn(Result.error(code));
        doThrow(new BusinessException(code)).when(restrictions).require(USER, action);
    }

    @Test
    void offersCannotBeMadeOrCountered() {
        restricted(RestrictedAction.MAKE_OFFER, RestrictionErrorCodes.ACCOUNT_RESTRICTED_OFFER);
        OfferRepository offers = mock(OfferRepository.class);
        IUserService users = mock(IUserService.class);
        OfferService service = new OfferService(offers, mock(ListingQueryService.class), users,
                mock(OfferEmailNotificationService.class), mock(OfferValidator.class), mock(OfferMapper.class),
                new OfferStockHoldService(mock(InventoryRedisReservationService.class)), new OfferConfigProperties(),
                restrictions);

        assertThat(service.create(USER, new CreateOfferRequest()).getErrorCode()).isEqualTo("ACCOUNT_RESTRICTED_OFFER");
        assertThat(service.counter(USER, UUID.randomUUID(), new CounterOfferRequest()).getErrorCode())
                .isEqualTo("ACCOUNT_RESTRICTED_OFFER");
        assertThat(service.createSellerOffer(USER, 2L, UUID.randomUUID(), BigDecimal.TEN, 24).getErrorCode())
                .isEqualTo("ACCOUNT_RESTRICTED_OFFER");
        verifyNoInteractions(offers, users);
    }

    @Test
    void checkoutAndStockReservationAreRefused() {
        restricted(RestrictedAction.CHECKOUT, RestrictionErrorCodes.ACCOUNT_RESTRICTED_CHECKOUT);
        CheckoutPricingContextFactory pricing = mock(CheckoutPricingContextFactory.class);
        CheckoutOrchestrator orchestrator = new CheckoutOrchestrator(mock(CartRepository.class),
                mock(OrderCreationService.class), mock(OrderPaymentService.class), mock(OrderRepository.class),
                mock(OrderMapper.class), mock(CouponService.class), mock(IOfferService.class), mock(EscrowService.class),
                pricing, mock(CheckoutStockReservationService.class), mock(ApplicationEventPublisher.class), restrictions);
        CartRepository carts = mock(CartRepository.class);
        CheckoutStockReservationService reservation = new CheckoutStockReservationService(
                mock(ListingRepository.class), mock(InventoryRedisReservationService.class), carts, restrictions);

        assertThat(orchestrator.executeCheckout(USER, mock(CheckoutRequest.class)).getErrorCode())
                .isEqualTo("ACCOUNT_RESTRICTED_CHECKOUT");
        assertThat(reservation.reserveUserCartStock(USER).getErrorCode()).isEqualTo("ACCOUNT_RESTRICTED_CHECKOUT");
        verifyNoInteractions(pricing, carts);
    }

    @Test
    void listingsCannotBePublishedOrReactivated() {
        restricted(RestrictedAction.CREATE_LISTING, RestrictionErrorCodes.ACCOUNT_RESTRICTED_LISTING);
        ListingValidationService validation = mock(ListingValidationService.class);
        ListingCommandService service = new ListingCommandService(mock(ListingRepository.class),
                mock(ApplicationEventPublisher.class), validation, mock(ListingConfig.class),
                mock(PriceHistoryService.class), mock(EntityManager.class), mock(InventoryService.class), restrictions);

        assertThat(service.publish(UUID.randomUUID(), USER).getErrorCode()).isEqualTo("ACCOUNT_RESTRICTED_LISTING");
        assertThat(service.reactivate(UUID.randomUUID(), USER).getErrorCode()).isEqualTo("ACCOUNT_RESTRICTED_LISTING");
        verifyNoInteractions(validation);
    }

    @Test
    void messagesCannotBeSent() {
        restricted(RestrictedAction.SEND_MESSAGE, RestrictionErrorCodes.ACCOUNT_RESTRICTED_CHAT);
        MessageRepository messages = mock(MessageRepository.class);
        ChatAuthorizationService authorization = mock(ChatAuthorizationService.class);
        ChatService chat = new ChatService(restrictions, mock(ChatRoomRepository.class), messages,
                mock(ListingRepository.class), mock(IUserService.class), new ChatRoomMapper(),
                mock(ChatMessageMapper.class), mock(ChatRoomEnricher.class), mock(ChatNotificationService.class),
                mock(ChatRoomUpdater.class), authorization, mock(IOfferService.class), mock(OfferRepository.class));
        ChatMessageDto dto = new ChatMessageDto();
        dto.setSenderId(USER);
        dto.setContent("hi");

        assertThatThrownBy(() -> chat.sendMessage(dto)).isInstanceOf(BusinessException.class);
        verifyNoInteractions(messages, authorization);
    }

    @Test
    @SuppressWarnings("unchecked")
    void newListingsCannotBeCreated() {
        restricted(RestrictedAction.CREATE_LISTING, RestrictionErrorCodes.ACCOUNT_RESTRICTED_LISTING);
        IUserService users = mock(IUserService.class);
        com.serhat.secondhand.inventory.application.InventoryService inventory =
                mock(com.serhat.secondhand.inventory.application.InventoryService.class);
        var service = (com.serhat.secondhand.listing.application.category.AbstractListingService<
                com.serhat.secondhand.listing.domain.entity.Listing, Object>) mock(
                com.serhat.secondhand.listing.application.category.AbstractListingService.class,
                withSettings().useConstructor(users, mock(ListingValidationService.class),
                                mock(com.serhat.secondhand.listing.domain.mapper.ListingMapper.class),
                                mock(com.serhat.secondhand.listing.validation.common.ListingValidationEngine.class), inventory)
                        .defaultAnswer(CALLS_REAL_METHODS));
        service.setUserRestrictionService(restrictions);

        assertThat(service.createListing(new Object(), USER).getErrorCode())
                .isEqualTo(RestrictionErrorCodes.ACCOUNT_RESTRICTED_LISTING.getCode());
        verifyNoInteractions(users, inventory);
    }
}
