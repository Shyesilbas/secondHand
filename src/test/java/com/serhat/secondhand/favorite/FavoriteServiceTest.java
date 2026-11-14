package com.serhat.secondhand.favorite;

import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.favorite.application.FavoriteService;
import com.serhat.secondhand.favorite.application.FavoriteStatsService;
import com.serhat.secondhand.favorite.application.ListingAccessService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.favorite.domain.mapper.FavoriteMapper;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.favorite.util.FavoriteErrorCodes;
import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock private FavoriteRepository favoriteRepository;
    @Mock private FavoriteMapper favoriteMapper;
    @Mock private FavoriteStatsService favoriteStatsService;
    @Mock private ListingRepository listingRepository;
    @Mock private ListingMapper listingMapper;
    @Mock private ListingEnrichmentService listingEnrichmentService;
    @Mock private IUserService userService;
    @Mock private NotificationTemplateCatalog notificationTemplateCatalog;
    @Mock private NotificationEventPublisher notificationEventPublisher;
    @Mock private ChatService chatService;
    @Mock private IOfferService offerService;

    private FavoriteService favoriteService;
    private User buyer;
    private User seller;
    private SportsListing listing;
    private UUID listingId;

    @BeforeEach
    void setUp() {
        favoriteService = new FavoriteService(
                favoriteRepository,
                new ListingAccessService(listingRepository),
                favoriteMapper,
                favoriteStatsService,
                listingRepository,
                listingMapper,
                listingEnrichmentService,
                userService,
                notificationTemplateCatalog,
                notificationEventPublisher,
                chatService,
                offerService
        );
        buyer = User.builder().id(10L).name("Ayse").surname("Yilmaz").email("ayse@test.com").build();
        seller = User.builder().id(20L).name("Mehmet").surname("Demir").build();
        listingId = UUID.randomUUID();
        listing = SportsListing.builder()
                .id(listingId)
                .title("Mountain Bike")
                .seller(seller)
                .status(ListingStatus.ACTIVE)
                .build();
    }

    @Test
    void addToFavorites_rejectsOwnListingInactiveListingAndDuplicates() {
        when(userService.findById(20L)).thenReturn(Result.success(seller));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        assertThat(favoriteService.addToFavorites(20L, listingId).getErrorCode())
                .isEqualTo(FavoriteErrorCodes.OWN_LISTING.getCode());

        listing.setStatus(ListingStatus.INACTIVE);
        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        assertThat(favoriteService.addToFavorites(10L, listingId).getErrorCode())
                .isEqualTo(FavoriteErrorCodes.INACTIVE_LISTING.getCode());

        listing.setStatus(ListingStatus.ACTIVE);
        when(favoriteRepository.save(any(Favorite.class))).thenThrow(new DataIntegrityViolationException("dup"));
        assertThat(favoriteService.addToFavorites(10L, listingId).getErrorCode())
                .isEqualTo(FavoriteErrorCodes.ALREADY_FAVORITED.getCode());
    }

    @Test
    void addToFavorites_savesAndPublishesOutboxNotification() {
        Favorite saved = Favorite.builder().id(1L).user(buyer).listing(listing).build();
        FavoriteDto dto = FavoriteDto.builder().id(1L).userId(10L).build();
        NotificationRequest notifReq = new NotificationRequest();

        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(favoriteRepository.save(any(Favorite.class))).thenReturn(saved);
        when(notificationTemplateCatalog.listingFavorited(20L, listingId, "Mountain Bike", 10L, "Ayse Yilmaz"))
                .thenReturn(notifReq);
        when(favoriteMapper.toDto(saved)).thenReturn(dto);

        Result<FavoriteDto> result = favoriteService.addToFavorites(10L, listingId);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEqualTo(dto);
        verify(notificationEventPublisher).publishDispatch(
                notifReq,
                "favorite",
                "listing-favorited:20:" + listingId + ":10"
        );
    }

    @Test
    void removeFromFavorites_andToggleFavorite_handleStateTransitions() {
        when(userService.findById(10L)).thenReturn(Result.success(buyer));
        when(favoriteRepository.deleteByUserAndListingIdIfExists(buyer, listingId)).thenReturn(0);

        assertThat(favoriteService.removeFromFavorites(10L, listingId).getErrorCode())
                .isEqualTo(FavoriteErrorCodes.NOT_FAVORITED.getCode());

        FavoriteStatsDto stats = FavoriteStatsDto.builder().favoriteCount(0L).build();
        when(favoriteRepository.existsByUserAndListingId(buyer, listingId)).thenReturn(true);
        when(favoriteRepository.deleteByUserAndListingIdIfExists(buyer, listingId)).thenReturn(1);
        when(favoriteStatsService.getFavoriteStats(listingId, 10L)).thenReturn(stats);

        Result<FavoriteStatsDto> toggleResult = favoriteService.toggleFavorite(10L, listingId);
        assertThat(toggleResult.isSuccess()).isTrue();
        assertThat(toggleResult.getData().getFavoriteCount()).isZero();
    }
}
