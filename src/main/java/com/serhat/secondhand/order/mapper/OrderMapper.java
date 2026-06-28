package com.serhat.secondhand.order.mapper;

import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.shipping.mapper.ShippingMapper;
import com.serhat.secondhand.user.domain.mapper.AddressMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ListingMapper listingMapper;
    private final AddressMapper addressMapper;
    private final ShippingMapper shippingMapper;

    /**
     * Maps an Order to OrderDto with cancellation/refund details.
     */
    public OrderDto toDto(Order order, 
                         Map<Long, Integer> cancelledByItemId, 
                         Map<Long, Integer> refundedByItemId,
                         Map<Long, String> cancelReasons,
                         Map<Long, String> cancelReasonTexts,
                         Map<Long, String> refundReasons,
                         Map<Long, String> refundReasonTexts) {
        if (order == null) {
            return null;
        }

        String sellerPhone = null;
        String sellerFullName = null;
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            OrderItem firstItem = order.getOrderItems().get(0);
            if (firstItem.getSeller() != null) {
                sellerPhone = firstItem.getSeller().getPhoneNumber();
                sellerFullName = firstItem.getSeller().getName() + " " + firstItem.getSeller().getSurname();
            }
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .name(order.getName())
                .userId(order.getUser().getId())
                .buyerName(order.getUser().getName())
                .buyerSurname(order.getUser().getSurname())
                .buyerEmail(order.getUser().getEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .campaignDiscount(order.getCampaignDiscount())
                .couponCode(order.getCouponCode())
                .couponDiscount(order.getCouponDiscount())
                .discountTotal(order.getDiscountTotal())
                .currency(order.getCurrency())
                .shippingAddress(addressMapper.toDto(order.getShippingAddress()))
                .billingAddress(order.getBillingAddress() != null ? addressMapper.toDto(order.getBillingAddress()) : null)
                .notes(order.getNotes())
                .paymentReference(order.getPaymentReference())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(orderItemsToDtoList(order.getOrderItems(), 
                        cancelledByItemId, refundedByItemId, 
                        cancelReasons, cancelReasonTexts, 
                        refundReasons, refundReasonTexts))
                .shipping(shippingMapper.toDto(order.getShipping()))
                .deliveryMethod(order.getDeliveryMethod())
                .meetupLocation(order.getMeetupLocation())
                .verificationAttempts(order.getVerificationAttempts())
                .verificationLockedUntil(order.getVerificationLockedUntil())
                .meetupVerifiedAt(order.getMeetupVerifiedAt())
                .meetupVerificationCode(order.getMeetupVerificationCode())
                .meetupVerificationCodeGeneratedAt(order.getMeetupVerificationCodeGeneratedAt())
                .completedAt(order.getCompletedAt())
                .completedByUserId(order.getCompletedByUser() != null ? order.getCompletedByUser().getId() : null)
                .completedByUserName(order.getCompletedByUser() != null ? (order.getCompletedByUser().getName() != null ? order.getCompletedByUser().getName() + " " + (order.getCompletedByUser().getSurname() != null ? order.getCompletedByUser().getSurname() : "") : order.getCompletedByUser().getEmail()) : null)
                .buyerPhone(order.getUser().getPhoneNumber())
                .sellerPhone(sellerPhone)
                .sellerFullName(sellerFullName)
                .build();
    }

    /** Legacy support for mapping without reasons */
    public OrderDto toDto(Order order, Map<Long, Integer> cancelledByItemId, Map<Long, Integer> refundedByItemId) {
        return toDto(order, cancelledByItemId, refundedByItemId, Map.of(), Map.of(), Map.of(), Map.of());
    }

    /** Convenience overload when no cancellation/refund data is needed (e.g. write-path responses). */
    public OrderDto toDto(Order order) {
        return toDto(order, Map.of(), Map.of());
    }

    private List<OrderItemDto> orderItemsToDtoList(List<OrderItem> orderItems,
                                                    Map<Long, Integer> cancelledByItemId,
                                                    Map<Long, Integer> refundedByItemId,
                                                    Map<Long, String> cancelReasons,
                                                    Map<Long, String> cancelReasonTexts,
                                                    Map<Long, String> refundReasons,
                                                    Map<Long, String> refundReasonTexts) {
        if (orderItems == null) {
            return null;
        }
        return orderItems.stream()
                .map(item -> orderItemToDto(item, 
                        cancelledByItemId, refundedByItemId, 
                        cancelReasons, cancelReasonTexts, 
                        refundReasons, refundReasonTexts))
                .toList();
    }

    private OrderItemDto orderItemToDto(OrderItem orderItem,
                                         Map<Long, Integer> cancelledByItemId,
                                         Map<Long, Integer> refundedByItemId,
                                         Map<Long, String> cancelReasons,
                                         Map<Long, String> cancelReasonTexts,
                                         Map<Long, String> refundReasons,
                                         Map<Long, String> refundReasonTexts) {
        if (orderItem == null) {
            return null;
        }

        Integer cancelledQuantity = cancelledByItemId.getOrDefault(orderItem.getId(), 0);
        Integer refundedQuantity = refundedByItemId.getOrDefault(orderItem.getId(), 0);

        String sellerName = null;
        String sellerSurname = null;
        if (orderItem.getSeller() != null) {
            sellerName = orderItem.getSeller().getName();
            sellerSurname = orderItem.getSeller().getSurname();
        }

        return OrderItemDto.builder()
                .id(orderItem.getId())
                .orderId(orderItem.getOrder().getId())
                .listing(listingMapper.toDynamicDto(orderItem.getListing()))
                .sellerName(sellerName)
                .sellerSurname(sellerSurname)
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .totalPrice(orderItem.getTotalPrice())
                .currency(orderItem.getCurrency())
                .notes(orderItem.getNotes())
                .createdAt(orderItem.getCreatedAt())
                .cancelledQuantity(cancelledQuantity > 0 ? cancelledQuantity : null)
                .refundedQuantity(refundedQuantity > 0 ? refundedQuantity : null)
                .cancelReason(cancelReasons.get(orderItem.getId()))
                .cancelReasonText(cancelReasonTexts.get(orderItem.getId()))
                .refundReason(refundReasons.get(orderItem.getId()))
                .refundReasonText(refundReasonTexts.get(orderItem.getId()))
                .build();
    }
}
