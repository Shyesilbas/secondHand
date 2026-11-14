package com.serhat.secondhand.dashboard;

import com.serhat.secondhand.dashboard.application.DashboardService;
import com.serhat.secondhand.dashboard.application.port.FavoriteStatisticsPort;
import com.serhat.secondhand.dashboard.application.port.ListingStatisticsPort;
import com.serhat.secondhand.dashboard.application.port.ListingViewStatisticsPort;
import com.serhat.secondhand.dashboard.application.port.OfferStatisticsPort;
import com.serhat.secondhand.dashboard.application.port.ReviewStatisticsPort;
import com.serhat.secondhand.dashboard.application.port.SalesStatisticsPort;
import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.mapper.DashboardMapper;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private SalesStatisticsPort salesStatisticsPort;
    @Mock private ListingStatisticsPort listingStatisticsPort;
    @Mock private ReviewStatisticsPort reviewStatisticsPort;
    @Mock private FavoriteStatisticsPort favoriteStatisticsPort;
    @Mock private ListingViewStatisticsPort listingViewStatisticsPort;
    @Mock private OfferStatisticsPort offerStatisticsPort;

    private DashboardService dashboardService;
    private LocalDateTime start;
    private LocalDateTime end;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
                salesStatisticsPort,
                listingStatisticsPort,
                reviewStatisticsPort,
                favoriteStatisticsPort,
                new DashboardMapper(),
                listingViewStatisticsPort,
                offerStatisticsPort,
                Runnable::run
        );
        start = LocalDateTime.of(2026, 1, 1, 0, 0);
        end = LocalDateTime.of(2026, 1, 31, 23, 59);
    }

    @Test
    void getSellerDashboard_aggregatesMetricsGrowthFunnelAndTopListings() {
        UUID listingId = UUID.randomUUID();
        SportsListing topListing = SportsListing.builder()
                .id(listingId)
                .listingNo("LST-1")
                .title("Road Bike")
                .build();

        when(salesStatisticsPort.sumRevenueBySellerAndDateRange(1L, start, end)).thenReturn(new BigDecimal("1500.00"));
        when(salesStatisticsPort.sumRevenueBySellerAndDateRange(eq(1L), any(), eq(start))).thenReturn(new BigDecimal("1000.00"));
        when(salesStatisticsPort.getDailyRevenueTrend(1L, start, end))
                .thenReturn(List.<Object[]>of(new Object[]{Date.valueOf(LocalDate.of(2026, 1, 5)), new BigDecimal("500.00")}));
        when(salesStatisticsPort.countDistinctOrdersBySellerAndStatusGrouped(1L, start, end))
                .thenReturn(List.<Object[]>of(new Object[]{"COMPLETED", 3L}, new Object[]{"PENDING", 1L}));
        when(listingStatisticsPort.countBySellerId(1L)).thenReturn(8L);
        when(listingStatisticsPort.countBySellerIdAndStatus(1L, ListingStatus.ACTIVE)).thenReturn(5L);
        when(listingStatisticsPort.countBySellerIdAndStatus(1L, ListingStatus.INACTIVE)).thenReturn(3L);
        when(listingViewStatisticsPort.getAggregatedViewStatisticsForSeller(1L, start, end))
                .thenReturn(ListingViewStatsDto.builder().totalViews(200L).uniqueViews(150L).build());
        when(favoriteStatisticsPort.countByListingSellerId(1L)).thenReturn(20L);
        when(salesStatisticsPort.sumRevenueBySellerAndCategory(1L, start, end)).thenReturn(List.of());
        when(reviewStatisticsPort.getUserReviewStats(1L))
                .thenReturn(new ReviewStatsDto(4L, 4.5, 3L, 1L, 0L, 0L, 0L, 0L));
        when(salesStatisticsPort.findTopListingsByRevenue(1L, start, end))
                .thenReturn(List.<Object[]>of(new Object[]{listingId, new BigDecimal("1200.00"), 2L}));
        when(salesStatisticsPort.countOrdersBySellerAndCategory(1L, start, end)).thenReturn(List.of());
        when(salesStatisticsPort.countDistinctListingsSoldBySellerAndDateRange(1L, start, end)).thenReturn(2L);
        when(offerStatisticsPort.countOffersBySellerAndStatusGrouped(1L, start, end))
                .thenReturn(List.<Object[]>of(new Object[]{"ACCEPTED", 2L}, new Object[]{"REJECTED", 2L}));
        when(listingStatisticsPort.findAllByIdIn(List.of(listingId))).thenReturn(List.of(topListing));
        when(favoriteStatisticsPort.getFavoriteStatsForListings(List.of(listingId), 1L))
                .thenReturn(Map.of(listingId, FavoriteStatsDto.builder().favoriteCount(7L).build()));
        when(reviewStatisticsPort.getListingReviewStatsDto(List.of(listingId)))
                .thenReturn(Map.of(listingId, new ReviewStatsDto(1L, 5.0, 1L, 0L, 0L, 0L, 0L, 0L)));

        SellerDashboardDto dto = dashboardService.getSellerDashboard(1L, start, end);

        assertThat(dto.getTotalRevenue()).isEqualByComparingTo("1500.00");
        assertThat(dto.getRevenueGrowth()).isEqualByComparingTo("50.00");
        assertThat(dto.getTotalOrders()).isEqualTo(4L);
        assertThat(dto.getCompletedOrders()).isEqualTo(3L);
        assertThat(dto.getOfferStats().getAcceptanceRate()).isEqualTo(50.0);
        assertThat(dto.getFunnel().getViewToFavoriteRate()).isEqualTo(10.0);
        assertThat(dto.getTopListings()).hasSize(1);
        assertThat(dto.getTopListings().get(0).getFavoriteCount()).isEqualTo(7L);
    }

    @Test
    void getBuyerDashboard_computesAovOrdersAndWatchlistAlerts() {
        UUID favId = UUID.randomUUID();
        SportsListing favListing = SportsListing.builder()
                .id(favId)
                .title("Helmet")
                .price(new BigDecimal("300.00"))
                .status(ListingStatus.ACTIVE)
                .build();
        Order activeOrder = Order.builder()
                .id(5L)
                .orderNumber("ORD-5")
                .totalAmount(new BigDecimal("400.00"))
                .orderItems(new ArrayList<>(List.of(OrderItem.builder()
                        .listing(favListing)
                        .seller(User.builder().id(9L).name("Can").surname("Oz").build())
                        .build())))
                .build();

        when(salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(2L, start, end)).thenReturn(new BigDecimal("500.00"));
        when(salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(eq(2L), any(), eq(start))).thenReturn(BigDecimal.ZERO);
        when(salesStatisticsPort.countOrdersByUserIdAndCreatedAtBetween(2L, start, end)).thenReturn(2L);
        when(salesStatisticsPort.getDailySpendingTrend(2L, start, end)).thenReturn(List.of());
        when(salesStatisticsPort.countOrdersByUserIdAndStatusGrouped(2L, start, end))
                .thenReturn(List.<Object[]>of(new Object[]{"DELIVERED", 1L}, new Object[]{"SHIPPED", 1L}));
        when(salesStatisticsPort.sumSpendingByBuyerAndCategory(2L, start, end)).thenReturn(List.of());
        when(salesStatisticsPort.countOrdersByBuyerAndCategory(2L, start, end)).thenReturn(List.of());
        when(reviewStatisticsPort.countByReviewerId(2L)).thenReturn(1L);
        when(favoriteStatisticsPort.countByUserId(2L)).thenReturn(1L);
        when(offerStatisticsPort.countOffersByBuyerAndStatusGrouped(2L, start, end)).thenReturn(List.of());
        when(salesStatisticsPort.findActiveOrdersForBuyer(2L)).thenReturn(List.of(activeOrder));
        when(favoriteStatisticsPort.findListingIdsByUserId(2L)).thenReturn(List.of(favId));
        when(listingStatisticsPort.findAllByIdIn(List.of(favId))).thenReturn(List.of(favListing));

        BuyerDashboardDto dto = dashboardService.getBuyerDashboard(2L, start, end);

        assertThat(dto.getAverageOrderValue()).isEqualByComparingTo("250.00");
        assertThat(dto.getCompletedOrders()).isEqualTo(1L);
        assertThat(dto.getPendingOrders()).isEqualTo(1L);
        assertThat(dto.getPriceDropAlerts()).hasSize(1);
        assertThat(dto.getActiveDeliveries()).hasSize(1);
    }

    @Test
    void getGlobalListingStatistics_mapsCountsByListingType() {
        when(listingStatisticsPort.getTotalListingCount()).thenReturn(10L);
        when(listingStatisticsPort.getListingCountByStatus(ListingStatus.ACTIVE)).thenReturn(7L);
        when(listingStatisticsPort.getActiveSellerCount(ListingStatus.ACTIVE)).thenReturn(4L);
        when(listingStatisticsPort.getActiveCityCount(ListingStatus.ACTIVE)).thenReturn(2L);
        when(listingStatisticsPort.getActiveCountsByType(ListingStatus.ACTIVE))
                .thenReturn(List.<Object[]>of(new Object[]{"BOOKS", 3L}, new Object[]{"SPORTS", 4L}));

        ListingStatisticsDto stats = dashboardService.getGlobalListingStatistics();

        assertThat(stats.getActiveListings()).isEqualTo(7L);
        assertThat(stats.getBooksCount()).isEqualTo(3L);
        assertThat(stats.getSportsCount()).isEqualTo(4L);
    }
}
