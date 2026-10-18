package com.serhat.secondhand.order;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.OrderQueryService;
import com.serhat.secondhand.order.application.OrderValidationService;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.user.application.IUserService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
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
}
