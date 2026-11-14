package com.serhat.secondhand.review;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.review.application.ReviewService;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.review.mapper.ReviewMapper;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.review.util.ReviewErrorCodes;
import com.serhat.secondhand.review.validator.ReviewValidator;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.event.SellerEligibilityRecheckEvent;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private IUserService userService;
    @Mock private ReviewMapper reviewMapper;
    @Mock private ListingRepository listingRepository;
    @Mock private INotificationService notificationService;
    @Mock private NotificationTemplateCatalog notificationTemplateCatalog;
    @Mock private ApplicationEventPublisher eventPublisher;

    private ReviewService reviewService;
    private User buyer;
    private User seller;
    private SportsListing listing;
    private Order fulfilledOrder;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(
                reviewRepository,
                orderItemRepository,
                userService,
                reviewMapper,
                listingRepository,
                new ReviewValidator(),
                notificationService,
                notificationTemplateCatalog,
                eventPublisher
        );
        buyer = User.builder().id(1L).build();
        seller = User.builder().id(2L).build();
        listing = SportsListing.builder().id(UUID.randomUUID()).title("Tennis Racket").seller(seller).build();
        fulfilledOrder = Order.builder()
                .id(10L)
                .user(buyer)
                .deliveryMethod(DeliveryMethod.CARGO)
                .status(OrderStatus.DELIVERED)
                .shipping(Shipping.builder().status(ShippingStatus.DELIVERED).build())
                .build();
        orderItem = OrderItem.builder().id(55L).order(fulfilledOrder).listing(listing).seller(seller).build();
    }

    @Test
    void createReview_rejectsUnfulfilledOrderAndWrongUser() {
        User stranger = User.builder().id(99L).build();
        when(userService.findById(99L)).thenReturn(Result.success(stranger));
        when(orderItemRepository.findById(55L)).thenReturn(Optional.of(orderItem));

        Result<ReviewDto> wrongUser = reviewService.createReview(99L, CreateReviewRequest.builder().orderItemId(55L).rating(5).build());
        assertThat(wrongUser.getErrorCode()).isEqualTo(ReviewErrorCodes.ORDER_ITEM_NOT_BELONG_TO_USER.getCode());

        fulfilledOrder.setShipping(Shipping.builder().status(ShippingStatus.IN_TRANSIT).build());
        fulfilledOrder.setStatus(OrderStatus.SHIPPED);
        when(userService.findById(1L)).thenReturn(Result.success(buyer));

        Result<ReviewDto> notDelivered = reviewService.createReview(1L, CreateReviewRequest.builder().orderItemId(55L).rating(5).build());
        assertThat(notDelivered.getErrorCode()).isEqualTo(ReviewErrorCodes.ORDER_NOT_DELIVERED.getCode());
    }

    @Test
    void createReview_mapsDuplicateConstraintToReviewAlreadyExists() {
        Review mapped = Review.builder().id(3).rating(4).build();
        when(userService.findById(1L)).thenReturn(Result.success(buyer));
        when(orderItemRepository.findById(55L)).thenReturn(Optional.of(orderItem));
        when(reviewMapper.fromCreateRequest(any(), any(), any(), any())).thenReturn(mapped);
        when(reviewRepository.save(mapped)).thenThrow(new DataIntegrityViolationException("duplicate"));

        Result<ReviewDto> result = reviewService.createReview(1L, CreateReviewRequest.builder().orderItemId(55L).rating(4).build());

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(ReviewErrorCodes.REVIEW_ALREADY_EXISTS.getCode());
    }

    @Test
    void createReview_savesReviewPublishesEligibilityEventAndIgnoresNotificationFailure() {
        CreateReviewRequest request = CreateReviewRequest.builder().orderItemId(55L).rating(5).comment("Great").build();
        Review mapped = Review.builder().id(3).rating(5).comment("Great").build();
        ReviewDto expectedDto = ReviewDto.builder().id(3).rating(5).build();
        NotificationRequest notifRequest = new NotificationRequest();

        when(userService.findById(1L)).thenReturn(Result.success(buyer));
        when(orderItemRepository.findById(55L)).thenReturn(Optional.of(orderItem));
        when(reviewMapper.fromCreateRequest(request, buyer, seller, orderItem)).thenReturn(mapped);
        when(reviewRepository.save(mapped)).thenReturn(mapped);
        when(notificationTemplateCatalog.reviewReceived(2L, 2L, 3, 5, 55L, listing.getId(), "Tennis Racket"))
                .thenReturn(notifRequest);
        when(notificationService.createAndSend(notifRequest)).thenThrow(new RuntimeException("ws down"));
        when(reviewMapper.toDto(mapped)).thenReturn(expectedDto);

        Result<ReviewDto> result = reviewService.createReview(1L, request);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEqualTo(expectedDto);
        verify(eventPublisher).publishEvent(new SellerEligibilityRecheckEvent(2L));
    }

    @Test
    void getReviewsForListing_rejectsInvalidUuid_andStableCacheKeyIsSorted() {
        assertThat(reviewService.getReviewsForListing("not-uuid", PageRequest.of(0, 10)).getErrorCode())
                .isEqualTo(ListingErrorCodes.INVALID_LISTING_ID.getCode());

        UUID b = UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff");
        UUID a = UUID.fromString("00000000-0000-0000-0000-000000000001");
        assertThat(reviewService.createStableListingStatsKey(List.of(b, a, a)))
                .isEqualTo(a + "," + b);

        when(reviewRepository.getListingReviewStats(List.of(a))).thenReturn(List.of());
        Map<UUID, ReviewStatsDto> stats = reviewService.getListingReviewStatsDto(List.of(a));
        assertThat(stats).containsKey(a);
    }
}
