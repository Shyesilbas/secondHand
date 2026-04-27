package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.user.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PaymentMapper {

    @Mapping(target = "paymentId", source = "id")
    @Mapping(target = "senderDisplayName", expression = "java(getDisplayName(payment.getFromUser()))")
    @Mapping(target = "receiverDisplayName", expression = "java(getDisplayName(payment.getToUser()))")
    @Mapping(target = "isSuccess", source = "success")
    PaymentDto toDto(Payment payment);

    default String getDisplayName(User user) {
        if (user == null) return "SYSTEM";
        String name = user.getName() != null ? user.getName() : "";
        String surname = user.getSurname() != null ? user.getSurname() : "";
        if (name.isEmpty() && surname.isEmpty()) return "UNKNOWN";
        return (name + " " + surname).trim();
    }

    default Payment fromPaymentRequest(PaymentRequest paymentRequest, User fromUser, User toUser, PaymentResult result) {
        return Payment.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(paymentRequest.amount())
                .currency(paymentRequest.currency() != null ? paymentRequest.currency() : "TRY")
                .listingId(paymentRequest.listingId())
                .listingTitle(paymentRequest.listingTitle())
                .listingNo(paymentRequest.listingNo())
                .paymentType(paymentRequest.paymentType())
                .transactionType(paymentRequest.transactionType())
                .paymentDirection(paymentRequest.paymentDirection())
                .processedAt(result.processedAt())
                .isSuccess(result.success())
                .idempotencyKey(paymentRequest.idempotencyKey())
                .status(paymentRequest.status() != null ? paymentRequest.status() : com.serhat.secondhand.payment.entity.PaymentStatus.COMPLETED)
                .orderId(paymentRequest.orderId())
                .build();
    }
}


