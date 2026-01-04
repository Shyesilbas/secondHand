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
    @Mapping(target = "senderName", expression = "java(payment.getFromUser() != null ? payment.getFromUser().getName() : \"SYSTEM\")")
    @Mapping(target = "senderSurname", expression = "java(payment.getFromUser() != null ? payment.getFromUser().getSurname() : \"\")")
    @Mapping(target = "receiverName", expression = "java(payment.getToUser() != null ? payment.getToUser().getName() : \"SYSTEM\")")
    @Mapping(target = "receiverSurname", expression = "java(payment.getToUser() != null ? payment.getToUser().getSurname() : \"\")")
    @Mapping(target = "listingTitle", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "createdAt", source = "processedAt")
    @Mapping(target = "isSuccess", source = "success")
    PaymentDto toDto(Payment payment);

    default Payment fromPaymentRequest(PaymentRequest paymentRequest, User fromUser, User toUser, PaymentResult result) {
        return Payment.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(paymentRequest.amount())
                .paymentType(paymentRequest.paymentType())
                .transactionType(paymentRequest.transactionType())
                .paymentDirection(paymentRequest.paymentDirection())
                .listingId(paymentRequest.listingId())
                .processedAt(result.processedAt())
                .isSuccess(result.success())
                .idempotencyKey(paymentRequest.idempotencyKey())
                .build();
    }
}


