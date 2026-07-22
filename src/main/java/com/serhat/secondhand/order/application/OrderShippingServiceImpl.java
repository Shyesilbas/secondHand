package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderShipRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.shipping.application.ShippingService;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderShippingServiceImpl implements OrderShippingService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderLogService orderLog;
    private final ShippingService shippingService;

    @Override
    @Transactional
    public Result<OrderDto> shipOrder(Long orderId, OrderShipRequest request, User seller) {
        return orderRepository.findByIdWithOrderItemsAndSellers(orderId)
                .map(order -> {
                    Result<Void> shippingValidation = validateSellerCanShip(order, seller);
                    if (shippingValidation.isError()) {
                        return Result.<OrderDto>error(shippingValidation.getErrorCode(), shippingValidation.getMessage());
                    }

                    try {
                        if (order.getStatus() == com.serhat.secondhand.order.entity.enums.OrderStatus.CONFIRMED) {
                            order.markAsProcessing();
                        }
                        
                        // Delegate shipment creation to ShippingService
                        Result<ShippingDto> shipmentResult = shippingService.createShipmentForOrder(order.getShipping().getId(), request.getProviderName());
                        if (shipmentResult.isError()) {
                            return Result.<OrderDto>error(shipmentResult.getErrorCode(), shipmentResult.getMessage());
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

    private Result<Void> validateSellerCanShip(Order order, User seller) {
        if (order.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP || order.getShipping() == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_SHIPPABLE);
        }
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_NOT_FOUND);
        }

        Set<Long> sellerIds = order.getOrderItems().stream()
                .map(OrderItem::getSeller)
                .map(itemSeller -> itemSeller != null ? itemSeller.getId() : null)
                .collect(Collectors.toSet());

        if (sellerIds.contains(null)) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_MISSING_SELLER);
        }
        if (!sellerIds.contains(seller.getId())) {
            return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        if (sellerIds.size() > 1) {
            return Result.error(OrderErrorCodes.ORDER_HAS_MULTIPLE_SELLERS);
        }

        for (OrderItem item : order.getOrderItems()) {
            if (item.getSeller() == null || !seller.getId().equals(item.getSeller().getId())) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_MISSING_SELLER);
            }
        }

        return Result.success();
    }
}
