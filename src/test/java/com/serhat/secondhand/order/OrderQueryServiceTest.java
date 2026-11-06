package com.serhat.secondhand.order;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.OrderQueryService;
import com.serhat.secondhand.order.application.OrderValidationService;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderListFilter;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.user.application.IUserService;
import org.junit.jupiter.api.Test;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

class OrderQueryServiceTest {

    @Test
    void sellerOrderDto_hidesMeetupVerificationCode() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        OrderMapper orderMapper = mock(OrderMapper.class);
        OrderQueryService service = new OrderQueryService(orderRepository, orderMapper,
                mock(EscrowService.class), mock(IUserService.class), mock(OrderValidationService.class),
                mock(OrderItemCancelRepository.class), mock(OrderItemRefundRepository.class), null);

        Order order = new Order();
        when(orderRepository.findByIdForSeller(1L, 10L)).thenReturn(Optional.of(order));
        OrderDto mapped = OrderDto.builder().meetupVerificationCode("123456").build();
        when(orderMapper.toDto(eq(order), any(), any(), any(), any(), any(), any())).thenReturn(mapped);

        Result<OrderDto> result = service.getSellerOrderById(1L, 10L);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getMeetupVerificationCode()).isNull();
    }

    @Test
    void userOrders_withoutStatusFilter_queriesEveryStatus() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        OrderQueryService service = new OrderQueryService(orderRepository, mock(OrderMapper.class),
                mock(EscrowService.class), mock(IUserService.class), mock(OrderValidationService.class),
                mock(OrderItemCancelRepository.class), mock(OrderItemRefundRepository.class), null);
        when(orderRepository.findByUserIdAndDeliveryMethod(eq(7L), isNull(), any(), isNull(), any())).thenReturn(Page.empty());

        service.getUserOrders(7L, OrderListFilter.NONE, PageRequest.of(0, 10));

        verify(orderRepository).findByUserIdAndDeliveryMethod(eq(7L), isNull(), eq(EnumSet.allOf(OrderStatus.class)), isNull(), any());
    }

    @Test
    void userOrders_withStatusFilter_passesRequestedStatuses_andBlankOrderNumberIsIgnored() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        OrderQueryService service = new OrderQueryService(orderRepository, mock(OrderMapper.class),
                mock(EscrowService.class), mock(IUserService.class), mock(OrderValidationService.class),
                mock(OrderItemCancelRepository.class), mock(OrderItemRefundRepository.class), null);
        Set<OrderStatus> statuses = EnumSet.of(OrderStatus.SHIPPED, OrderStatus.DELIVERED);
        when(orderRepository.findByUserIdAndDeliveryMethod(eq(7L), isNull(), any(), isNull(), any())).thenReturn(Page.empty());

        service.getUserOrders(7L, new OrderListFilter(null, statuses, "  "), PageRequest.of(0, 10));

        verify(orderRepository).findByUserIdAndDeliveryMethod(eq(7L), isNull(), eq(statuses), isNull(), any());
    }
}
