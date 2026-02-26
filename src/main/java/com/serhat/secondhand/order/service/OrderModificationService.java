package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderModificationService {

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final OrderMapper orderMapper;
    private final IOrderValidationService orderValidationService;
    private final OrderLogService orderLog;

    public Result<OrderDto> updateOrderAddress(Long orderId, Long shippingAddressId, Long billingAddressId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> modifiableResult = validateOrderIsModifiable(order);
        if (modifiableResult.isError()) return modifiableResult.propagateError();

        Address shippingAddress = addressRepository.findById(shippingAddressId).orElse(null);
        if (shippingAddress == null) {
            return Result.error(OrderErrorCodes.ADDRESS_NOT_FOUND);
        }
        if (!shippingAddress.getUser().getId().equals(user.getId())) {
            return Result.error(OrderErrorCodes.ADDRESS_NOT_BELONG_TO_USER);
        }

        order.setShippingAddress(shippingAddress);

        if (billingAddressId != null) {
            Address billingAddress = addressRepository.findById(billingAddressId).orElse(null);
            if (billingAddress == null) {
                return Result.error(OrderErrorCodes.ADDRESS_NOT_FOUND);
            }
            if (!billingAddress.getUser().getId().equals(user.getId())) {
                return Result.error(OrderErrorCodes.BILLING_ADDRESS_NOT_BELONG_TO_USER);
            }
            order.setBillingAddress(billingAddress);
        } else {
            order.setBillingAddress(null);
        }

        Order savedOrder = orderRepository.save(order);
        orderLog.logOrderModified(order.getOrderNumber(), "address");
        return Result.success(orderMapper.toDto(savedOrder));
    }

    public Result<OrderDto> updateOrderNotes(Long orderId, String notes, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> modifiableResult = validateOrderIsModifiable(order);
        if (modifiableResult.isError()) return modifiableResult.propagateError();

        if (notes != null && notes.length() > 1000) {
            return Result.error(OrderErrorCodes.INVALID_ORDER_NOTES);
        }

        order.setNotes(notes);
        Order savedOrder = orderRepository.save(order);

        orderLog.logOrderModified(order.getOrderNumber(), "notes");
        return Result.success(orderMapper.toDto(savedOrder));
    }

    private Result<Void> validateOrderIsModifiable(Order order) {
        if (!Order.OrderStatus.MODIFIABLE_STATUSES.contains(order.getStatus())) {
            return Result.error(OrderErrorCodes.ORDER_NOT_MODIFIABLE);
        }
        return Result.success();
    }
}

