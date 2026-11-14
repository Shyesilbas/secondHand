package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderShipRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderShippingPolicy;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.shipping.application.ShippingService;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
@RequiredArgsConstructor
public class OrderShippingServiceImpl implements OrderShippingService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderLogService orderLog;
    private final ShippingService shippingService;
    private final OrderShippingPolicy orderShippingPolicy;

    @Override
    @Transactional
    public Result<OrderDto> shipOrder(Long orderId, OrderShipRequest request, User seller) {
        return orderRepository.findByIdWithOrderItemsAndSellers(orderId)
                .map(order -> {
                    Result<Void> shippingValidation = orderShippingPolicy.validateShippable(order, seller.getId());
                    if (shippingValidation.isError()) {
                        return Result.<OrderDto>error(shippingValidation.getMessage(), shippingValidation.getErrorCode());
                    }

                    try {
                        if (order.getStatus() == com.serhat.secondhand.order.entity.enums.OrderStatus.CONFIRMED) {
                            order.markAsProcessing();
                        }
                        
                        // Delegate shipment creation to ShippingService
                        Result<ShippingDto> shipmentResult = shippingService.createShipmentForOrder(order.getShipping().getId(), request.getProviderName());
                        if (shipmentResult.isError()) {
                            return Result.<OrderDto>error(shipmentResult.getMessage(), shipmentResult.getErrorCode());
                        }

                        ShippingDto shipment = shipmentResult.getData();
                        order.markAsShipped(
                                shipment.getProviderName(),
                                shipment.getTrackingNumber(),
                                shipment.getTrackingUrl(),
                                shipment.getProviderShipmentId(),
                                shipment.getLabelUrl(),
                                shipment.getShippingCost()
                        );

                        Order savedOrder = orderRepository.save(order);
                        
                        orderLog.logStatusChanged(order.getOrderNumber(), "PROCESSING", "SHIPPED");
                        log.info("Order {} marked as shipped by seller {}", order.getOrderNumber(), seller.getEmail());
                        
                        return Result.success(orderMapper.toDto(savedOrder));
                    } catch (IllegalStateException e) {
                        return Result.<OrderDto>error(e.getMessage(), "INVALID_ORDER_STATUS");
                    }
                })
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }
}
