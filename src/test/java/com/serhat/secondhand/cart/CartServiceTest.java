package com.serhat.secondhand.cart;

import com.serhat.secondhand.cart.application.CartReservationScheduler;
import com.serhat.secondhand.cart.application.CartService;
import com.serhat.secondhand.cart.application.CartSocialMetricService;
import com.serhat.secondhand.cart.config.CartConfig;
import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.mapper.CartMapper;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.cart.validator.CartValidator;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.UserBlockService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartMapper cartMapper;
    @Mock private IUserService userService;
    @Mock private ListingEnrichmentService enrichmentService;
    @Mock private ListingRepository listingRepository;
    @Mock private CartReservationScheduler cartReservationScheduler;
    @Mock private InventoryService inventoryService;
    @Mock private CartSocialMetricService cartSocialMetricService;
    @Mock private UserBlockService userBlockService;

    private CartConfig cartConfig;
    private CartValidator cartValidator;
    private CartService cartService;
    private User buyer;
    private User seller;
    private SportsListing listing;
    private UUID listingId;

    @BeforeEach
    void setUp() {
        cartConfig = new CartConfig();
        cartValidator = new CartValidator(cartConfig, inventoryService);
        cartService = new CartService(
                cartRepository,
                cartMapper,
                userService,
                cartValidator,
                enrichmentService,
                listingRepository,
                cartConfig,
                cartReservationScheduler,
                inventoryService,
                cartSocialMetricService,
                userBlockService
        );
        buyer = User.builder().id(10L).build();
        seller = User.builder().id(20L).build();
        listingId = UUID.randomUUID();
        listing = SportsListing.builder()
                .id(listingId)
                .seller(seller)
                .status(ListingStatus.ACTIVE)
                .listingType(ListingType.SPORTS)
                .build();
    }

    @Test
    void addToCart_accumulatesExistingQuantityAndRecordsSocialMetric() {
        Cart existing = Cart.builder().id(1L).user(buyer).listing(listing).quantity(2).build();
        SportsListingDto listingDto = new SportsListingDto();
        listingDto.setId(listingId);
        CartDto dto = CartDto.builder().id(1L).quantity(5).listing(listingDto).build();

        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(inventoryService.getAvailableQuantity(listingId)).thenReturn(8);
        when(cartRepository.findByUserIdAndListingId(10L, listingId)).thenReturn(Optional.of(existing));
        when(cartRepository.save(existing)).thenReturn(existing);
        when(cartMapper.toDto(existing)).thenReturn(dto);

        Result<CartDto> result = cartService.addToCart(10L, AddToCartRequest.builder()
                .listingId(listingId)
                .quantity(3)
                .notes("Gift wrap")
                .build());

        assertThat(result.isSuccess()).isTrue();
        assertThat(existing.getQuantity()).isEqualTo(5);
        assertThat(existing.getNotes()).isEqualTo("Gift wrap");
        verify(cartSocialMetricService).recordListingAddedToCart(listingId, 10L);
        verify(enrichmentService).enrichInPlace(dto.getListing(), 10L);
    }

    @Test
    void addToCart_rejectsExceedingAvailableStock() {
        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(inventoryService.getAvailableQuantity(listingId)).thenReturn(2);
        when(cartRepository.findByUserIdAndListingId(10L, listingId)).thenReturn(Optional.empty());

        Result<CartDto> result = cartService.addToCart(10L, AddToCartRequest.builder()
                .listingId(listingId)
                .quantity(3)
                .build());

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(CartErrorCodes.INSUFFICIENT_STOCK.getCode());
        verify(cartRepository, never()).save(any());
    }

    @Test
    void addToCart_rejectsBlockedBuyerSellerPair() {
        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        doThrow(new BusinessException("Blocked", org.springframework.http.HttpStatus.FORBIDDEN, "USER_BLOCKED"))
                .when(userBlockService).requireNotBlocked(10L, 20L);

        assertThatThrownBy(() -> cartService.addToCart(10L, AddToCartRequest.builder()
                .listingId(listingId)
                .quantity(1)
                .build()))
                .isInstanceOf(BusinessException.class);
        verify(cartRepository, never()).save(any());
    }

    @Test
    void updateCartItem_setsExactQuantityAndClearsNotesWhenNullPassed() {
        Cart existing = Cart.builder().id(1L).user(buyer).listing(listing).quantity(4).notes("Old note").build();
        SportsListingDto listingDto = new SportsListingDto();
        listingDto.setId(listingId);
        CartDto dto = CartDto.builder().id(1L).quantity(2).listing(listingDto).build();

        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(inventoryService.getAvailableQuantity(listingId)).thenReturn(5);
        when(cartRepository.findByUserIdAndListingId(10L, listingId)).thenReturn(Optional.of(existing));
        when(cartRepository.save(existing)).thenReturn(existing);
        when(cartMapper.toDto(existing)).thenReturn(dto);

        Result<CartDto> result = cartService.updateCartItem(10L, listingId, UpdateCartItemRequest.builder()
                .quantity(2)
                .notes(null)
                .build());

        assertThat(result.isSuccess()).isTrue();
        assertThat(existing.getQuantity()).isEqualTo(2);
        assertThat(existing.getNotes()).isNull();
    }

    @Test
    void removeFromCart_returnsNotFoundWhenMissingOrDeletesAndTracksMetric() {
        when(cartRepository.existsByUserIdAndListingId(10L, listingId)).thenReturn(false);
        assertThat(cartService.removeFromCart(10L, listingId).getErrorCode())
                .isEqualTo(CartErrorCodes.ITEM_NOT_FOUND_IN_CART.getCode());

        when(cartRepository.existsByUserIdAndListingId(10L, listingId)).thenReturn(true);
        assertThat(cartService.removeFromCart(10L, listingId).isSuccess()).isTrue();
        verify(cartRepository).deleteByUserIdAndListingId(10L, listingId);
        verify(cartSocialMetricService).recordListingRemovedFromCart(listingId, 10L);
    }

    @Test
    void clearCart_deletesItemsAndBatchUpdatesSocialMetrics() {
        Cart cartRow = Cart.builder().id(1L).user(buyer).listing(listing).quantity(1).build();
        when(cartRepository.findByUserId(10L)).thenReturn(List.of(cartRow));

        Result<Void> result = cartService.clearCart(10L);

        assertThat(result.isSuccess()).isTrue();
        verify(cartRepository).deleteByUserId(10L);
        verify(cartSocialMetricService).recordListingsRemovedFromCart(List.of(listingId), 10L);
    }
}
